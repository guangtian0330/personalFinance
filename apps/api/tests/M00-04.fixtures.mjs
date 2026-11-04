export const localConfig = Object.freeze({
  runtime: 'local-node',
  appEnv: 'development',
  mockAuth: 'true',
});
export const identity = Object.freeze({
  actorId: 'synthetic-local-developer',
  workspaceId: 'synthetic-local-workspace',
});
export const privateUrl = 'http://127.0.0.1:8787/api/v1/private/health';
export const invalidConfigurations = [
  ...['production', 'preview', 'staging', 'test', 'unknown', '', undefined].map((appEnv) => ({
    ...localConfig,
    appEnv,
  })),
  ...['production', 'preview', 'staging', 'test', 'unknown', ''].map((nodeEnv) => ({
    ...localConfig,
    nodeEnv,
  })),
  ...['TRUE', '1', '', 'yes'].map((mockAuth) => ({ ...localConfig, mockAuth })),
  { ...localConfig, runtime: 'deployed' },
];
