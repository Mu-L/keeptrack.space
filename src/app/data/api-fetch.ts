/**
 * Wrapper around fetch() that injects the API key header for
 * requests to api.keeptrack.space when an apiKey is configured.
 */
export const apiFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const apiKey = window.settingsManager?.apiKey;

  if (apiKey && url.includes('api.keeptrack.space')) {
    const headers = new Headers(init?.headers);

    headers.set('x-api-key', apiKey);

    return fetch(input, { ...init, headers });
  }

  return fetch(input, init);
};
