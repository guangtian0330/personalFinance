import type { AuthContext, AuthProvider } from '@finpath/core';
import type { Context, MiddlewareHandler } from 'hono';
import { ApiFailure, type ApiEnvironment } from './errors.ts';

export type AuthConfiguration = {
  readonly runtime: 'local-node' | 'deployed';
  readonly appEnv?: string | undefined;
  readonly nodeEnv?: string | undefined;
  readonly mockAuth?: string | undefined;
};

export class AuthConfigurationError extends Error {
  constructor() {
    super('Invalid authentication configuration; mock auth requires explicit local development.');
    this.name = 'AuthConfigurationError';
  }
}

const syntheticIdentity: AuthContext = Object.freeze({
  actorId: 'synthetic-local-developer',
  workspaceId: 'synthetic-local-workspace',
});

export function createAuthProvider(config: AuthConfiguration): AuthProvider {
  if (config.mockAuth !== undefined && config.mockAuth !== 'false' && config.mockAuth !== 'true') {
    throw new AuthConfigurationError();
  }
  if (config.mockAuth !== 'true') return { authenticate: async () => null };
  if (config.runtime !== 'local-node' || config.appEnv !== 'development'
    || (config.nodeEnv !== undefined && config.nodeEnv !== 'development')) {
    throw new AuthConfigurationError();
  }
  // Request headers, cookies and payloads never select or modify this identity.
  return { authenticate: async () => syntheticIdentity };
}

// Additional browser/rebinding protection; these headers never enable mock mode.
const localOrigins = new Set([
  'http://127.0.0.1:8787', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173',
]);

export function assertLocalMockRequest(request: Request): void {
  const origin = request.headers.get('Origin');
  const host = request.headers.get('Host');
  if (!localOrigins.has(new URL(request.url).origin)
    || (origin !== null && !localOrigins.has(origin))
    || (host !== null && !localOrigins.has(`http://${host}`))
    || request.headers.get('Sec-Fetch-Site') === 'cross-site'
    || ['Forwarded', 'X-Forwarded-Host', 'X-Forwarded-Proto', 'X-Forwarded-For']
      .some((name) => request.headers.has(name))) {
    throw new ApiFailure('UNAUTHENTICATED');
  }
}

export function requireAuth(provider: AuthProvider): MiddlewareHandler<ApiEnvironment> {
  return async (context, next) => {
    context.set('auth', null);
    const identity = await provider.authenticate(context.req.header('Authorization'));
    if (!identity || typeof identity.actorId !== 'string' || !identity.actorId.trim()
      || typeof identity.workspaceId !== 'string' || !identity.workspaceId.trim()) {
      throw new ApiFailure('UNAUTHENTICATED');
    }
    // Copy only verified fields into this request; never reuse mutable provider state.
    context.set('auth', Object.freeze({ actorId: identity.actorId, workspaceId: identity.workspaceId }));
    await next();
  };
}

export function getAuthContext(context: Context<ApiEnvironment>): AuthContext {
  const identity = context.get('auth');
  if (!identity) throw new ApiFailure('UNAUTHENTICATED');
  return identity;
}
