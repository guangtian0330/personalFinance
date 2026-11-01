// Synthetic protocol fixtures only; no user, tenant or financial records.
export const health = { status: 'ok', service: 'finpath-api' };
export const healthCheck = { check: 'health' };
export const invalidHealthChecks = [
  null, [], {}, { check: false }, { check: 'other' },
  { check: 'health', actorId: 'synthetic-untrusted-actor' },
  { check: 'health', workspaceId: 'synthetic-untrusted-workspace' },
];
export const invalidHealthResponses = [
  null, {}, { status: 'ok' }, { status: 'ok', service: 'other-api' },
  { ...health, unexpected: true },
];
export const invalidQueries = ['?unexpected=1', '?actorId=synthetic', '?check=health&check=other', '?=synthetic'];
export const errorResponse = {
  error: {
    code: 'INVALID_REQUEST',
    message: 'Invalid request.',
    details: {},
    requestId: '00000000-0000-4000-8000-000000000003',
  },
};
