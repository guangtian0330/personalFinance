import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const packagePaths = [
  'apps/web',
  'apps/api',
  'packages/core',
  'packages/contracts',
  'packages/persistence',
  'packages/ui',
];

function loadConfig(packagePath) {
  const configPath = path.join(root, packagePath, 'tsconfig.json');
  const result = ts.readConfigFile(configPath, ts.sys.readFile);
  assert.equal(result.error, undefined);
  const config = ts.parseJsonConfigFileContent(result.config, ts.sys, path.dirname(configPath));
  assert.deepEqual(config.errors, []);
  return config;
}

// Compile probes in memory using the real package settings; no production files
// or build output are mutated by the positive/negative test cases.
function diagnosticsFor(packagePath, source) {
  const config = loadConfig(packagePath);
  const filename = path.join(root, packagePath, 'src', '__M00-01_probe__.ts');
  const options = { ...config.options, composite: false, incremental: false, noEmit: true };
  delete options.tsBuildInfoFile;
  const host = ts.createCompilerHost(options);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (requested, languageVersion, onError, shouldCreateNewSourceFile) =>
    path.resolve(requested) === filename
      ? ts.createSourceFile(filename, source, languageVersion, true)
      : originalGetSourceFile(requested, languageVersion, onError, shouldCreateNewSourceFile);
  const program = ts.createProgram([filename], options, host);
  return ts.getPreEmitDiagnostics(program);
}

test('M00-01: all workspace dependency imports resolve with matching project references', () => {
  for (const packagePath of packagePaths) {
    const manifest = JSON.parse(readFileSync(path.join(root, packagePath, 'package.json'), 'utf8'));
    const config = loadConfig(packagePath);
    const references = new Set((config.projectReferences ?? []).map((ref) => path.resolve(ref.path)));
    for (const [name, version] of Object.entries(manifest.dependencies ?? {})) {
      assert.equal(version, 'workspace:*');
      const resolved = ts.resolveModuleName(
        name,
        path.join(root, packagePath, 'src', 'index.ts'),
        config.options,
        ts.sys,
      ).resolvedModule;
      assert.ok(resolved, `${manifest.name} must resolve ${name}; run pnpm build first`);
      const dependencyRoot = path.dirname(path.dirname(resolved.resolvedFileName));
      // Resolve the linked package's canonical path, including Windows junctions.
      assert.ok(references.has(path.resolve(ts.sys.realpath(dependencyRoot))), `${name} reference missing`);
    }
  }
});

test('M00-01: platform-neutral typed code compiles in core', () => {
  assert.deepEqual(diagnosticsFor('packages/core', 'export const values: readonly number[] = [1, 2];'), []);
});

test('M00-01: strict null, implicit-any and unchecked-index errors are rejected', () => {
  const diagnostics = diagnosticsFor('packages/core', [
    'export const value: string = null;',
    'export function identity(input) { return input; }',
    'const items: string[] = []; export const first: string = items[0];',
  ].join('\n'));
  const codes = diagnostics.map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes(2322), 'null/index assignments must be rejected');
  assert.ok(codes.includes(7006), 'implicit any must be rejected');
  assert.equal(codes.filter((code) => code === 2322).length, 2);
});

test('M00-01: exact optional properties reject an explicit undefined value', () => {
  const diagnostics = diagnosticsFor('packages/core',
    'export const value: { label?: string } = { label: undefined };');
  assert.ok(diagnostics.some((diagnostic) => diagnostic.code === 2375));
});

test('M00-01: core cannot use browser or Node ambient globals', () => {
  for (const name of ['document', 'window', 'process']) {
    const diagnostics = diagnosticsFor('packages/core', `export const value = ${name};`);
    assert.ok(diagnostics.some((diagnostic) => [2304, 2580, 2584, 2591].includes(diagnostic.code)), name);
  }
});

test('M00-01: the web package can use its browser DOM library', () => {
  assert.deepEqual(diagnosticsFor('apps/web', 'export const title: string = document.title;'), []);
});

test('M00-01: an undeclared workspace import fails resolution', () => {
  const diagnostics = diagnosticsFor('packages/core',
    'import type { Missing } from "@finpath/not-a-package"; export type Probe = Missing;');
  assert.ok(diagnostics.some((diagnostic) => diagnostic.code === 2307));
});
