import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const packageNames = new Set(
  ['erp', 'crm', 'mes', 'geo', 'manufacturing', 'video-script'].map(app => 'dsh-plugin-zhixing-ark-' + app),
);
const repository = 'git+https://github.com/geyaovip/zhixing-ark-dsh-plugins.git';
const registry = 'https://registry.npmjs.org';
const versionPattern = '(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)';
const archivePattern = new RegExp(`^([a-z0-9-]+)-(${versionPattern})\\.tgz$`);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function checkedAssets(directory) {
  const rows = readFileSync(join(directory, 'SHA256SUMS.txt'), 'utf8').trim().split(/\r?\n/);
  const names = new Set();
  const assets = rows.map(row => {
    const checksum = /^([0-9a-f]{64})\s+\*?(?:\.\/)?([^/\s]+)$/.exec(row);
    const file = checksum && archivePattern.exec(checksum[2]);
    if (!file || !packageNames.has(file[1]) || names.has(file[1])) {
      throw new Error('Unexpected or duplicate package in SHA256SUMS.txt');
    }
    const [, name, version] = file;
    names.add(name);
    const path = join(directory, file[0]);
    const archive = readFileSync(path);
    if (createHash('sha256').update(archive).digest('hex') !== checksum[1]) {
      throw new Error(`SHA-256 mismatch for ${file[0]}`);
    }
    const manifest = JSON.parse(execFileSync('tar', ['-xOzf', path, 'package/package.json'], { encoding: 'utf8' }));
    if (manifest.name !== name || manifest.version !== version || manifest.private || manifest.publishConfig) {
      throw new Error(`Unexpected package metadata for ${file[0]}`);
    }
    const integrity = 'sha512-' + createHash('sha512').update(archive).digest('base64');
    return { name, version, path, integrity, repository: manifest.repository?.url };
  });
  const downloaded = readdirSync(directory).filter(name => name.endsWith('.tgz'));
  if (downloaded.length !== assets.length) throw new Error('Release assets and SHA256SUMS.txt differ');
  return assets;
}

async function packageVersions(name) {
  const response = await fetch(`${registry}/${name}`, {
    headers: { Accept: 'application/vnd.npm.install-v1+json', 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`npm metadata request for ${name} failed with HTTP ${response.status}`);
  return response.json();
}

function isNewer(version, latest) {
  const current = version.split('.').map(BigInt);
  const previous = latest.split('.').map(BigInt);
  const index = current.findIndex((value, i) => value !== previous[i]);
  return index !== -1 && current[index] > previous[index];
}

async function publishPlan(assets) {
  const registryEntries = await Promise.all(assets.map(asset => packageVersions(asset.name)));
  return assets.filter((asset, index) => {
    const { name, version, integrity } = asset;
    const npmEntry = registryEntries[index];
    const existing = npmEntry.versions?.[version];
    if (existing) {
      if (existing.dist?.integrity !== integrity) throw new Error(`npm integrity conflict for ${name}@${version}`);
      console.log(`Already published with matching integrity: ${name}@${version}`);
      return false;
    }
    const latest = npmEntry['dist-tags']?.latest;
    if (!new RegExp(`^${versionPattern}$`).test(latest) || !isNewer(version, latest)) {
      throw new Error(`Refusing to replace npm latest ${latest} with ${name}@${version}`);
    }
    if (asset.repository !== repository) throw new Error(`Missing npm provenance repository for ${name}@${version}`);
    return true;
  });
}

const assets = checkedAssets(process.argv[2]);
const pending = await publishPlan(assets);
for (const { name, version, path } of pending) {
  if (process.env.DRY_RUN === 'true') {
    console.log(`Would publish: ${name}@${version}`);
    continue;
  }
  execFileSync(npm, ['publish', path, '--ignore-scripts', '--access=public', '--tag=latest', '--registry=' + registry], {
    stdio: 'inherit',
  });
}
