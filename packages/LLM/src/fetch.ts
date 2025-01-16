type FetchOptions = RequestInit & { retries?: number };

/**
 * A simple wrapper around fetch to make it more manageable.
 * Include retries + backoff, error handling and logging, etc.
 * @param input the Fetch parameters
 * @param init the Fetch init parameters, plus a `retries` option for the number of retries (default 6)
 * @returns the value, or undefined in case of an error.
 */
export async function enhancedFetch<T>(
  input: string,
  init?: FetchOptions,
): Promise<T | undefined> {
  const maxRetries = init?.retries ?? 6;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(input, init);

      if (!response.ok) {
        console.error(response);
        console.error(response.body);
        throw new Error(`${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error(`Fetch error on ${input}:`, error);

      // Only retry on network errors or rate limiting
      if (
        error instanceof TypeError ||
        (error instanceof Error && error.message.includes('429'))
      ) {
        retryCount++;
        if (retryCount < maxRetries) {
          // Exponential backoff with jitter

          await sleep({ retryCount });
        }
      } else {
        // For other errors, return undefined
        return undefined;
      }
    }
  }

  console.error('Max retries reached');
  return undefined;
}

/**
 * Wait with and exponential backoff and jitter
 * @param root named parameters
 * @param root.retryCount the number of retries
 */
async function sleep({ retryCount }: { retryCount: number }): Promise<void> {
  const delay = Math.min(
    // eslint-disable-next-line sonarjs/pseudo-random -- safe to use
    1000 * 2 ** retryCount + Math.random() * 1000,
    60_000,
  );
  await new Promise((resolve) => {
    return setTimeout(resolve, delay);
  });
}
