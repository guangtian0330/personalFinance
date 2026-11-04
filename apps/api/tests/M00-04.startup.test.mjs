import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

for (const entry of ['../src/dev.ts', '../dist/dev.js']) {
  test(`M00-04: ${entry} rejects unsafe mock settings before opening a listener`, () => {
    for (const flags of [
      { APP_ENV: 'production', MOCK_AUTH: 'true' },
      { APP_ENV: 'preview', MOCK_AUTH: 'true' },
      { APP_ENV: 'staging', MOCK_AUTH: 'true' },
      { MOCK_AUTH: 'true' },
      { APP_ENV: 'development', NODE_ENV: 'production', MOCK_AUTH: 'true' },
      { APP_ENV: 'development', MOCK_AUTH: 'TRUE' },
    ]) {
      const env = { ...process.env };
      for (const name of ['APP_ENV', 'NODE_ENV', 'MOCK_AUTH']) delete env[name];
      Object.assign(env, flags);
      const result = spawnSync(process.execPath, [fileURLToPath(new URL(entry, import.meta.url))], {
        env,
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /FinPath API: invalid auth configuration/);
      assert.doesNotMatch(result.stdout, /FinPath API: http/);
    }
  });
}
