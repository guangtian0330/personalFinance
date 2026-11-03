// Trusted identity and one resolved tenant. No HTTP, framework or runtime types.
export interface AuthContext {
  readonly actorId: string;
  readonly workspaceId: string;
}

export interface AuthProvider {
  // The credential is untrusted and opaque; a real provider must verify it.
  authenticate(credential: string | undefined): Promise<AuthContext | null>;
}
