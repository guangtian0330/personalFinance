import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const vitest = fileURLToPath(new URL('vitest.mjs', import.meta.resolve('vitest/package.json')));
const biome = fileURLToPath(
  new URL('bin/biome', import.meta.resolve('@biomejs/biome/package.json')),
);

function run(entry, args, input) {
  const result = spawnSync(process.execPath, [entry, ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 30000,
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
    input,
  });
  assert.equal(result.error, undefined);
  assert.equal(result.signal, null);
  return { code: result.status, output: result.stdout + result.stderr };
}

test('M00-05: the real Vitest config rejects an isolated failing assertion and focused test', () => {
  const tests = path.resolve(root, 'tests');
  const directory = mkdtempSync(path.join(tests, 'M00-05-probe-'));
  const filename = path.join(directory, 'sentinel.vitest.test.mjs');
  try {
    writeFileSync(
      filename,
      "import {test,expect} from 'vitest';\ntest('M00-05 failure sentinel',()=>expect('synthetic-actual').toBe('synthetic-expected'));\n",
    );
    const failure = run(vitest, ['run', filename]);
    assert.equal(failure.code, 1, failure.output);
    assert.match(failure.output, /M00-05 failure sentinel/);
    assert.match(failure.output, /AssertionError/);
    writeFileSync(
      filename,
      "import {test} from 'vitest';\ntest.only('M00-05 focused sentinel',()=>{});\n",
    );
    const focused = run(vitest, ['run', filename]);
    assert.equal(focused.code, 1, focused.output);
    assert.match(focused.output, /only|allowOnly/);
  } finally {
    // Delete only the exact temporary child created by this test.
    assert.equal(path.dirname(path.resolve(directory)), tests);
    assert.ok(path.basename(directory).startsWith('M00-05-probe-'));
    rmSync(directory, { recursive: true, force: true });
  }
});

test('M00-05: lint and format reject bad fixtures and accept their valid replacement', () => {
  const tests = path.resolve(root, 'tests');
  const directory = mkdtempSync(path.join(tests, 'M00-05-probe-'));
  const filename = path.join(directory, 'quality.mjs');
  // Probe directories are gitignored to prevent accidental delivery after a crash.
  // Disable only VCS filtering for these explicit paths; retain the real rule set.
  const args = ['--vcs-enabled=false', filename];
  try {
    writeFileSync(filename, 'debugger;\n');
    const lint = run(biome, ['lint', ...args]);
    assert.equal(lint.code, 1, lint.output);
    assert.match(lint.output, /noDebugger/);
    writeFileSync(filename, 'export const synthetic={ok:true}\n');
    const format = run(biome, ['format', ...args]);
    assert.equal(format.code, 1, format.output);
    assert.match(format.output, /format/);
    writeFileSync(filename, 'export const synthetic = { ok: true };\n');
    for (const command of ['lint', 'format']) {
      const valid = run(biome, [command, ...args]);
      assert.equal(valid.code, 0, valid.output);
    }
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), tests);
    assert.ok(path.basename(directory).startsWith('M00-05-probe-'));
    rmSync(directory, { recursive: true, force: true });
  }
});
