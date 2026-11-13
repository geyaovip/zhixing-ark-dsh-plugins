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
  for (const app of ['erp', 'crm', 'mes', 'geo']) {
    const source = join(root, app);
    const target = join(staging, app);
    mkdirSync(join(target, 'shared'), { recursive: true });
    for (const file of ['package.json', 'README.md', 'cordis.patch.yml']) {
      copyFileSync(join(source, file), join(target, file));
    }
    for (const file of ['connection.mjs', 'plugin.mjs']) {
      copyFileSync(join(root, 'shared', file), join(target, 'shared', file));
    }
    const index = readFileSync(join(source, 'index.js'), 'utf8');
    writeFileSync(join(target, 'index.js'), index.replace('../shared/plugin.mjs', './shared/plugin.mjs'));
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const result = spawnSync(npm, ['pack', '--ignore-scripts', '--pack-destination', dest], {
      cwd: target, stdio: 'inherit', shell: process.platform === 'win32',
    });
    if (result.status !== 0) throw result.error ?? new Error('Unable to pack ' + app);
  }
} finally {
  rmSync(staging, { recursive: true, force: true });
}
