import { init } from './client.js';
import { deleteDocuments } from './memoire/sdk-memoire-delete.js';
import { ingestRawDocuments } from './memoire/sdk-memoire-ingest.js';
import { search } from './memoire/sdk-memoire-search.js';

/**
 * Create an instance of the Memoire SDK
 * @param root named parameters
 * @param root.apiKey the api key for Memoire
 * @param root.memoireUrl the url where Memoire is running
 * @returns a client with the methods to interact with Memoire
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- later
export function MemoireClient({
  apiKey,
  memoireUrl,
}: {
  apiKey: string;
  memoireUrl: string;
}) {
  init({ apiKey, url: memoireUrl });
  return {
    delete: deleteDocuments,
    ingest: {
      raw: ingestRawDocuments,
    },
    search,
  };
}
