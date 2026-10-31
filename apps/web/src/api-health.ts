export async function checkApiHealth(
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const timeout = AbortSignal.timeout(3000);
  const response = await fetcher('/health', {
    cache: 'no-store',
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });

  if (!response.ok) throw new Error('Health request failed');
  const payload: unknown = await response.json();
  if (
    typeof payload !== 'object' || payload === null ||
    !('status' in payload) || payload.status !== 'ok' ||
    !('service' in payload) || payload.service !== 'finpath-api'
  ) {
    throw new Error('Unexpected health response');
  }
}
