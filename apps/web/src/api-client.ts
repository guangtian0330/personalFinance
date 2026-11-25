import {
  API_ERRORS,
  API_PREFIX,
  AccountResponseSchema,
  CreateTransactionRequestSchema,
  ApiErrorResponseSchema,
  HealthCheckRequestSchema,
  HealthResponseSchema,
  TransactionPageResponseSchema,
  TransactionResponseSchema,
  type AccountResponse,
  type CreateTransactionRequest,
  type ApiErrorResponse,
  type HealthCheckRequest,
  type HealthResponse,
  type TransactionPageResponse,
  type TransactionResponse,
} from '@finpath/contracts';

export class ApiError extends Error {
  readonly status: number;
  readonly error: ApiErrorResponse['error'];

  constructor(status: number, payload: ApiErrorResponse) {
    super(payload.error.message);
    this.name = 'ApiError';
    this.status = status;
    this.error = payload.error;
  }
}

export class InvalidApiResponseError extends Error {
  constructor() {
    super('Invalid API response.');
    this.name = 'InvalidApiResponseError';
  }
}

export function createApiClient(fetcher: typeof fetch = fetch) {
  async function request<T>(
    path: string,
    options: RequestInit,
    schema: { safeParse(value: unknown): { success: boolean; data?: T } },
    expectedStatus: number,
  ): Promise<T> {
    const response = await fetcher(`${API_PREFIX}${path}`, options);
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      // A cancelled body read is a transport outcome, not malformed JSON.
      options.signal?.throwIfAborted();
      throw new InvalidApiResponseError();
    }

    if (!response.ok) {
      const error = ApiErrorResponseSchema.safeParse(payload);
      if (!error.success || API_ERRORS[error.data.error.code].status !== response.status) {
        throw new InvalidApiResponseError();
      }
      throw new ApiError(response.status, error.data);
    }

    const parsed = schema.safeParse(payload);
    if (response.status !== expectedStatus || !parsed.success) throw new InvalidApiResponseError();
    return parsed.data as T;
  }

  return {
    getHealth(signal?: AbortSignal): Promise<HealthResponse> {
      return request(
        '/health',
        { cache: 'no-store', ...(signal ? { signal } : {}) },
        HealthResponseSchema,
        200,
      );
    },
    checkHealth(input: HealthCheckRequest, signal?: AbortSignal): Promise<HealthResponse> {
      const parsed = HealthCheckRequestSchema.safeParse(input);
      if (!parsed.success) return Promise.reject(new Error('Invalid health check request.'));
      return request(
        '/health/check',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
          cache: 'no-store',
          ...(signal ? { signal } : {}),
        },
        HealthResponseSchema,
        200,
      );
    },
    getAccounts(signal?: AbortSignal): Promise<AccountResponse[]> {
      return request(
        '/private/accounts',
        { cache: 'no-store', ...(signal ? { signal } : {}) },
        { safeParse: (value) => AccountListSchema.safeParse(value) },
        200,
      );
    },
    getTransactions(
      cursor?: string | null,
      signal?: AbortSignal,
    ): Promise<TransactionPageResponse> {
      const query = new URLSearchParams({ pageSize: '100' });
      if (cursor) query.set('cursor', cursor);
      return request(
        `/private/transactions?${query.toString()}`,
        { cache: 'no-store', ...(signal ? { signal } : {}) },
        TransactionPageResponseSchema,
        200,
      );
    },
    createTransaction(
      input: CreateTransactionRequest,
      idempotencyKey: string,
      signal?: AbortSignal,
    ): Promise<TransactionResponse> {
      const parsed = CreateTransactionRequestSchema.safeParse(input);
      if (!parsed.success) return Promise.reject(new Error('Invalid transaction request.'));
      return request(
        '/private/transactions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
          body: JSON.stringify(parsed.data),
          cache: 'no-store',
          ...(signal ? { signal } : {}),
        },
        TransactionResponseSchema,
        201,
      );
    },
  };
}

const AccountListSchema = {
  safeParse(value: unknown) {
    if (!Array.isArray(value)) return { success: false as const };
    const accounts = [];
    for (const account of value) {
      const parsed = AccountResponseSchema.safeParse(account);
      if (!parsed.success) return { success: false as const };
      accounts.push(parsed.data);
    }
    return { success: true as const, data: accounts };
  },
};
