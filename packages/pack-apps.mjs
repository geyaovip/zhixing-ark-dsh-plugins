import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const dest = join(root, 'dist');
const staging = mkdtempSync(join(tmpdir(), 'zhixing-ark-harness-'));
try {
  mkdirSync(dest, { recursive: true });
  for (const app of ['erp', 'crm', 'mes', 'geo', 'manufacturing', 'product-video-script']) {
    const source = join(root, app);
    const target = join(staging, app);
    mkdirSync(target, { recursive: true });
    for (const file of ['package.json', 'README.md', 'cordis.patch.yml']) {
      copyFileSync(join(source, file), join(target, file));
    }
    if (app === 'product-video-script') {
      for (const file of ['index.js', 'SKILL.md']) copyFileSync(join(source, file), join(target, file));
    } else {
      const files = app === 'manufacturing'
        ? ['query-contract.mjs'] : ['connection.mjs', 'plugin.mjs', 'query-contract.mjs'];
      mkdirSync(join(target, 'shared'));
      for (const file of files) copyFileSync(join(root, 'shared', file), join(target, 'shared', file));
      for (const file of app === 'manufacturing' ? ['index.js', 'connection.js'] : ['index.js']) {
        const original = readFileSync(join(source, file), 'utf8');
        writeFileSync(join(target, file), original.replaceAll('../shared/', './shared/'));
      }
    }
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const result = spawnSync(npm, ['pack', '--ignore-scripts', '--pack-destination', dest], {
      cwd: target, stdio: 'inherit', shell: process.platform === 'win32',
    });
    if (result.status !== 0) throw result.error ?? new Error('Unable to pack ' + app);
  }
} finally {
  rmSync(staging, { recursive: true, force: true });
}
