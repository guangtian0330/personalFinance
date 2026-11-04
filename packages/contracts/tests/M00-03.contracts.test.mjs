import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import {
  ApiErrorResponseSchema,
  EmptyQuerySchema,
  HealthCheckRequestSchema,
  HealthResponseSchema,
} from '../dist/index.js';
import {
  errorResponse,
  health,
  healthCheck,
  invalidHealthChecks,
  invalidHealthResponses,
} from './M00-03.fixtures.mjs';

test('M00-03: shared schemas accept the synthetic request, response and error fixtures', () => {
  assert.deepEqual(HealthCheckRequestSchema.parse(healthCheck), healthCheck);
  assert.deepEqual(HealthResponseSchema.parse(health), health);
  assert.deepEqual(EmptyQuerySchema.parse({}), {});
  assert.deepEqual(ApiErrorResponseSchema.parse(errorResponse), errorResponse);
});

test('M00-03: schemas reject malformed and unknown fields rather than discarding them', () => {
  for (const input of invalidHealthChecks)
    assert.equal(HealthCheckRequestSchema.safeParse(input).success, false);
  for (const input of invalidHealthResponses)
    assert.equal(HealthResponseSchema.safeParse(input).success, false);
  assert.equal(EmptyQuerySchema.safeParse({ actorId: 'synthetic' }).success, false);
  for (const error of [
    { ...errorResponse.error, code: 'UNKNOWN' },
    { ...errorResponse.error, requestId: 'untrusted' },
    { ...errorResponse.error, details: { stack: 'synthetic-private-stack' } },
    { ...errorResponse.error, stack: 'synthetic-private-stack' },
    { ...errorResponse.error, message: '' },
  ])
    assert.equal(ApiErrorResponseSchema.safeParse({ error }).success, false);
});

const root = fileURLToPath(new URL('../../../', import.meta.url));
function compileConsumer(packagePath, source) {
  const configPath = path.join(root, packagePath, 'tsconfig.json');
  const result = ts.readConfigFile(configPath, ts.sys.readFile);
  assert.equal(result.error, undefined);
  const config = ts.parseJsonConfigFileContent(
    result.config,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath,
  );
  assert.deepEqual(config.errors, []);
  const filename = path.join(root, packagePath, 'src', '__M00-03_probe__.ts');
  const options = { ...config.options, composite: false, incremental: false, noEmit: true };
  delete options.tsBuildInfoFile;
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (requested, version, onError, fresh) =>
    path.resolve(requested) === filename
      ? ts.createSourceFile(filename, source, version, true)
      : original(requested, version, onError, fresh);
  return ts.getPreEmitDiagnostics(ts.createProgram([filename], options, host));
}

for (const consumer of ['apps/api', 'apps/web']) {
  test(`M00-03: Zod-inferred types compile and reject invalid assignments in ${consumer}`, () => {
    const imports =
      'import { HealthCheckRequestSchema, HealthResponseSchema, type HealthCheckRequest, type HealthResponse, type ErrorCode } from "@finpath/contracts";';
    assert.deepEqual(
      compileConsumer(
        consumer,
        `${imports}
      export const request: HealthCheckRequest = HealthCheckRequestSchema.parse({ check: 'health' });
      export const response: HealthResponse = HealthResponseSchema.parse({ status: 'ok', service: 'finpath-api' });
      export const requestLiteral: 'health' = request.check;
      export const statusLiteral: 'ok' = response.status;
      export const code: ErrorCode = 'INVALID_REQUEST';
    `,
      ),
      [],
    );
    const errors = compileConsumer(
      consumer,
      `${imports}
      export const request: HealthCheckRequest = { check: 'other' };
      export const response: HealthResponse = { status: 'ok', service: 'wrong-api' };
      export const code: ErrorCode = 'UNDECLARED';
    `,
    );
    assert.equal(errors.length, 3);
    assert.ok(errors.every((error) => error.code === 2322));
  });
}
