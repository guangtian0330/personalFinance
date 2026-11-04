import {
  API_ERRORS,
  API_PREFIX,
  ApiErrorResponseSchema,
  HealthCheckRequestSchema,
  HealthResponseSchema,
  type ApiErrorResponse,
  type HealthCheckRequest,
  type HealthResponse,
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
  async function request(path: string, options: RequestInit): Promise<HealthResponse> {
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

    const health = HealthResponseSchema.safeParse(payload);
    if (response.status !== 200 || !health.success) throw new InvalidApiResponseError();
    return health.data;
  }

  return {
    getHealth(signal?: AbortSignal): Promise<HealthResponse> {
      return request('/health', { cache: 'no-store', ...(signal ? { signal } : {}) });
    },
    checkHealth(input: HealthCheckRequest, signal?: AbortSignal): Promise<HealthResponse> {
      const parsed = HealthCheckRequestSchema.safeParse(input);
      if (!parsed.success) return Promise.reject(new Error('Invalid health check request.'));
      return request('/health/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
        cache: 'no-store',
        ...(signal ? { signal } : {}),
      });
    },
  };
}
