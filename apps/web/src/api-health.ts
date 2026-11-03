import { createApiClient } from './api-client.js';

export async function checkApiHealth(
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const timeout = AbortSignal.timeout(3000);
  await createApiClient(fetcher).getHealth(signal ? AbortSignal.any([signal, timeout]) : timeout);
}
