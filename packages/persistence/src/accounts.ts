import { asc, eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { accounts } from './schema.js';
import type { persistenceSchema } from './schema.js';

export type PersistenceDatabase = DrizzleD1Database<typeof persistenceSchema>;

export function listAccountsForWorkspace(db: PersistenceDatabase, workspaceId: string) {
  return db
    .select()
    .from(accounts)
    .where(eq(accounts.workspaceId, workspaceId))
    .orderBy(asc(accounts.name));
}
