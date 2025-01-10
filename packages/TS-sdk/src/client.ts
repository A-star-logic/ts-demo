let memoireUrl: string;
let key: string;

/**
 * Helper function to make fetch requests
 * @param endpoint API endpoint to call (relative to `memoireUrl`)
 * @param options Fetch options (method, headers, body, etc.)
 * @returns the fetch response
 */
export async function fetchRequest(
  endpoint: string,
  options: RequestInit,
): Promise<Response> {
  const url = `${memoireUrl}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, { ...options, headers });
}

/**
 * Initialize the client
 * @param root named parameters
 * @param root.apiKey the api key for Memoire
 * @param root.url the url where Memoire is running
 */
export function init({ apiKey, url }: { apiKey: string; url: string }): void {
  memoireUrl = url;
  key = apiKey;
}
