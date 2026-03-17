import { settingsManager } from '@app/settings/settings';

/**
 * Wrapper around fetch() that injects the API key header for
 * requests to api.keeptrack.space when an apiKey is configured.
 */
export const apiFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let url: string;

  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input.url;
  }
  const apiKey = settingsManager?.apiKey;

  if (apiKey && url.includes('api.keeptrack.space')) {
    const headers = new Headers(init?.headers);

    headers.set('x-api-key', apiKey);

    return fetch(input, { ...init, headers });
  }

  return fetch(input, init);
};
