import {
  API_PREFIX,
  AccountResponseSchema,
  CreateTransactionRequestSchema,
  EmptyQuerySchema,
  HealthCheckRequestSchema,
  HealthResponseSchema,
  TransactionPageResponseSchema,
  TransactionQuerySchema,
  TransactionResponseSchema,
  type AccountResponse,
  type CreateTransactionRequest,
  type TransactionResponse,
  type HealthResponse,
} from '@finpath/contracts';
import {
  createExpenseTransaction,
  createIncomeTransaction,
  createTransferTransaction,
  fromJsonMoney,
  toJsonMoney,
} from '@finpath/core';
import type { JournalTransaction } from '@finpath/core';
import type { LedgerRepository } from '@finpath/persistence/repository';
import { Hono } from 'hono';
import { ApiFailure, errorResponse, type ApiEnvironment } from './errors.ts';
import {
  AuthConfigurationError,
  assertLocalMockRequest,
  createAuthProvider,
  getAuthContext,
  requireAuth,
  type AuthConfiguration,
} from './auth.ts';

export function createApp(
  authConfig: AuthConfiguration = { runtime: 'deployed' },
  dependencies: { readonly ledger?: LedgerRepository } = {},
) {
  // Construct before listening: unsafe mock configurations fail at startup.
  const authProvider = createAuthProvider(authConfig);
  const localMock = authConfig.mockAuth === 'true';
  const app = new Hono<ApiEnvironment>();
  const health: HealthResponse = HealthResponseSchema.parse({
    status: 'ok',
    service: 'finpath-api',
  });

  app.use('*', async (context, next) => {
    const requestId = crypto.randomUUID();
    context.set('requestId', requestId);
    context.header('X-Request-Id', requestId);
    context.header('Cache-Control', 'no-store');
    context.set('auth', null);
    // Worker-style bindings arrive at dispatch, never from request headers.
    // A deployed handler cannot enable mock auth, even if labelled development.
    if (
      localMock &&
      [context.env?.APP_ENV, context.env?.NODE_ENV, context.env?.MOCK_AUTH].some(
        (value) => value !== undefined,
      )
    ) {
      throw new AuthConfigurationError();
    }
    createAuthProvider({ runtime: 'deployed', mockAuth: context.env?.MOCK_AUTH });
    await next();
  });

  app.onError((error, context) =>
    errorResponse(context, error instanceof ApiFailure ? error.code : 'INTERNAL_ERROR'),
  );
  app.notFound((context) => errorResponse(context, 'NOT_FOUND'));

  // Compatibility route keeps the M00-02 response and method semantics.
  app.get('/health', (context) => context.json(health));

  app.use(
    `${API_PREFIX}/private/*`,
    async (context, next) => {
      if (localMock) assertLocalMockRequest(context.req.raw);
      await next();
    },
    requireAuth(authProvider),
  );

  app.use(`${API_PREFIX}/*`, async (context, next) => {
    // URLSearchParams preserves empty names that router query helpers may drop.
    const url = new URL(context.req.url);
    const query = uniqueQueryParams(url);
    const transactionList =
      url.pathname === `${API_PREFIX}/private/transactions` && context.req.method === 'GET';
    const valid =
      query !== null &&
      (transactionList
        ? TransactionQuerySchema.safeParse(query).success
        : EmptyQuerySchema.safeParse(query).success);
    if (!valid) {
      throw new ApiFailure('INVALID_REQUEST');
    }
    await next();
  });

  app.get(`${API_PREFIX}/health`, (context) => context.json(health));

  // Protected, read-only smoke endpoint; no profile or financial API yet.
  app.get(`${API_PREFIX}/private/health`, (context) => {
    getAuthContext(context);
    return context.json(health);
  });

  app.get(`${API_PREFIX}/private/accounts`, async (context) => {
    const auth = getAuthContext(context);
    const ledger = requireLedger(dependencies.ledger);
    const accounts = await ledger.listAccounts(auth.workspaceId);
    const response: AccountResponse[] = accounts.map((account) =>
      AccountResponseSchema.parse({
        id: account.id,
        name: account.name,
        kind: account.kind,
        currency: account.currency,
        liquidityClass: account.liquidityClass,
      }),
    );
    return context.json(response);
  });

  app.get(`${API_PREFIX}/private/transactions`, async (context) => {
    const auth = getAuthContext(context);
    const ledger = requireLedger(dependencies.ledger);
    const parsedQuery = TransactionQuerySchema.safeParse(
      uniqueQueryParams(new URL(context.req.url)),
    );
    if (!parsedQuery.success) throw new ApiFailure('INVALID_REQUEST');
    const pageSize = Number(parsedQuery.data.pageSize ?? '50');
    if (pageSize > 100) throw new ApiFailure('INVALID_REQUEST');
    let cursor: { occurredAt: string; id: string } | undefined;
    if (parsedQuery.data.cursor) {
      const decoded = decodeCursor(parsedQuery.data.cursor);
      if (!decoded) throw new ApiFailure('INVALID_REQUEST');
      cursor = decoded;
    }
    const page = await ledger.listTransactions(auth.workspaceId, pageSize, cursor);
    const lastItem = page.items.at(-1);
    const nextCursor =
      page.hasMore && lastItem
        ? encodeCursor({ occurredAt: lastItem.occurredAt, id: lastItem.id })
        : null;
    const response = TransactionPageResponseSchema.parse({
      items: page.items.map(toTransactionResponse),
      nextCursor,
    });
    return context.json(response);
  });

  app.post(`${API_PREFIX}/private/transactions`, async (context) => {
    const auth = getAuthContext(context);
    const ledger = requireLedger(dependencies.ledger);
    if (
      context.req.header('Content-Type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json'
    ) {
      throw new ApiFailure('INVALID_REQUEST');
    }
    const idempotencyKey = context.req.header('Idempotency-Key');
    if (!idempotencyKey || !/^[\x21-\x7E]{1,128}$/.test(idempotencyKey)) {
      throw new ApiFailure('INVALID_REQUEST');
    }
    let input: unknown;
    try {
      input = await context.req.json<unknown>();
    } catch {
      throw new ApiFailure('INVALID_REQUEST');
    }
    const parsed = CreateTransactionRequestSchema.safeParse(input);
    if (!parsed.success) throw new ApiFailure('INVALID_REQUEST');
    const request = parsed.data;
    const requestHash = await hashRequest(request);

    const previous = await ledger.findByIdempotencyKey(auth.workspaceId, idempotencyKey);
    if (previous) {
      if (previous.requestHash !== requestHash) throw new ApiFailure('CONFLICT');
      return context.json(
        TransactionResponseSchema.parse(toTransactionResponse(previous.transaction)),
        201,
      );
    }

    const accounts = await ledger.listAccounts(auth.workspaceId);
    const journalInput = {
      id: crypto.randomUUID(),
      workspaceId: auth.workspaceId,
      actorId: auth.actorId,
      occurredAt: request.occurredAt,
      description: request.description,
    };
    const amount = (() => {
      try {
        return fromJsonMoney(request.amount);
      } catch {
        throw new ApiFailure('UNPROCESSABLE_ENTITY');
      }
    })();
    let transaction: JournalTransaction;
    try {
      if (request.kind === 'income') {
        transaction = createIncomeTransaction(
          {
            ...journalInput,
            amount,
            cashAccountId: request.cashAccountId,
            incomeAccountId: request.incomeAccountId,
          },
          accounts,
        );
      } else if (request.kind === 'expense') {
        transaction = createExpenseTransaction(
          {
            ...journalInput,
            amount,
            cashAccountId: request.paymentAccountId,
            expenseAccountId: request.expenseAccountId,
            paymentAccountId: request.paymentAccountId,
          },
          accounts,
        );
      } else {
        transaction = createTransferTransaction(
          {
            ...journalInput,
            amount,
            fromAccountId: request.fromAccountId,
            toAccountId: request.toAccountId,
          },
          accounts,
        );
      }
    } catch (error) {
      if (
        error instanceof RangeError &&
        error.message.includes('does not belong to this workspace')
      ) {
        throw new ApiFailure('NOT_FOUND');
      }
      if (error instanceof TypeError || error instanceof RangeError) {
        throw new ApiFailure('UNPROCESSABLE_ENTITY');
      }
      throw error;
    }

    try {
      await ledger.createAtomically(transaction, idempotencyKey, requestHash);
    } catch {
      // A concurrent request may have committed the same workspace/key first.
      const raced = await ledger.findByIdempotencyKey(auth.workspaceId, idempotencyKey);
      if (!raced) throw new ApiFailure('INTERNAL_ERROR');
      if (raced.requestHash !== requestHash) throw new ApiFailure('CONFLICT');
      return context.json(
        TransactionResponseSchema.parse(toTransactionResponse(raced.transaction)),
        201,
      );
    }
    const saved = await ledger.getTransaction(auth.workspaceId, transaction.id);
    return context.json(TransactionResponseSchema.parse(toTransactionResponse(saved)), 201);
  });

  // Stateless example exercises the shared request contract and error path.
  app.post(`${API_PREFIX}/health/check`, async (context) => {
    const mediaType = context.req.header('Content-Type')?.split(';')[0]?.trim().toLowerCase();
    if (mediaType !== 'application/json') throw new ApiFailure('INVALID_REQUEST');

    let input: unknown;
    try {
      input = await context.req.json<unknown>();
    } catch {
      throw new ApiFailure('INVALID_REQUEST');
    }
    if (!HealthCheckRequestSchema.safeParse(input).success) {
      throw new ApiFailure('INVALID_REQUEST');
    }
    return context.json(health);
  });

  return app;
}

function requireLedger(ledger: LedgerRepository | undefined): LedgerRepository {
  if (!ledger) throw new ApiFailure('SERVICE_UNAVAILABLE');
  return ledger;
}

function uniqueQueryParams(url: URL): Record<string, string> | null {
  const entries: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    if (Object.hasOwn(entries, key)) return null;
    entries[key] = value;
  }
  return entries;
}

function toTransactionResponse(transaction: {
  id: string;
  kind: string;
  occurredAt: string;
  status: string;
  description: string;
  reversalOfId: string | null;
  postings: readonly {
    id: string;
    accountId: string;
    side: string;
    amountMinor: bigint;
    currency: string;
  }[];
}): TransactionResponse {
  return {
    id: transaction.id,
    kind: transaction.kind as TransactionResponse['kind'],
    occurredAt: transaction.occurredAt,
    status: transaction.status as TransactionResponse['status'],
    description: transaction.description,
    reversalOfId: transaction.reversalOfId,
    postings: transaction.postings.map((posting) => ({
      id: posting.id,
      accountId: posting.accountId,
      side: posting.side as 'debit' | 'credit',
      amount: toJsonMoney({
        amountMinor: posting.amountMinor,
        currency: posting.currency as 'CAD' | 'CNY' | 'JPY',
      }),
    })),
  };
}

async function hashRequest(request: CreateTransactionRequest): Promise<string> {
  const canonical = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(canonical);
    if (typeof value !== 'object' || value === null) return value;
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, item]) => [key, canonical(item)]),
    );
  };
  const bytes = new TextEncoder().encode(JSON.stringify(canonical(request)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function encodeCursor(transaction: { occurredAt: string; id: string } | undefined): string {
  if (!transaction) throw new ApiFailure('INTERNAL_ERROR');
  const bytes = new TextEncoder().encode(JSON.stringify(transaction));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeCursor(value: string): { occurredAt: string; id: string } | null {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
    const base64 =
      value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const valueObject: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof valueObject !== 'object' || valueObject === null || Array.isArray(valueObject))
      return null;
    const cursor = valueObject as Record<string, unknown>;
    if (
      Object.keys(cursor).length !== 2 ||
      typeof cursor.occurredAt !== 'string' ||
      !cursor.occurredAt.endsWith('Z') ||
      Number.isNaN(Date.parse(cursor.occurredAt)) ||
      typeof cursor.id !== 'string' ||
      !cursor.id
    )
      return null;
    return { occurredAt: cursor.occurredAt, id: cursor.id };
  } catch {
    return null;
  }
}

export default createApp();
