// libs
import { MemoireClient } from '@astarlogic/sdk/memoire';

// utils
import { getUnsafeHash } from '../utils/scraper-utils-crypto.js';

if (!process.env.MEMOIRE_API_KEY) {
  throw new Error('Please set the MEMOIRE_API_KEY env variable');
}
if (!process.env.MEMOIRE_URL) {
  throw new Error('Please set the MEMOIRE_URL env variable');
}

const memoire = MemoireClient({
  apiKey: process.env.MEMOIRE_API_KEY,
  memoireUrl: process.env.MEMOIRE_URL,
});

const urlQueue = new Map<
  string,
  'blocked' | 'crawled' | 'failed' | 'not found' | undefined
>();

/**
 * Add a list of urls into the crawling queue. Duplicates and already crawled urls will be skipped.
 * @param root named parameters
 * @param root.urls the urls to add
 */
export async function addUrlsToCrawlList({
  urls,
}: {
  urls: string[];
}): Promise<void> {
  for (const url of urls) {
    if (!urlQueue.has(url)) {
      urlQueue.set(url, undefined);
      console.log('Added `' + url + '` to queue');
    }
  }
}

/**
 * Export the url queue
 * @returns the urls and their status
 */
export function exportUrls(): {
  [k: string]: string | undefined;
} {
  return Object.fromEntries(urlQueue);
}

/**
 * Request the next url from the crawling queue
 * @returns the next url, undefined when all urls have been crawled
 */
export async function getNextUrl(): Promise<string | undefined> {
  const notCrawled = [...urlQueue].find(([_, isCrawled]) => {
    return !isCrawled;
  });
  if (notCrawled) {
    return notCrawled[0];
  }
}

/**
 * Create an ID for the page and save it to memoire for future retrieval
 * @param root named parameters
 * @param root.url the url of the page
 * @param root.content the content extracted from the page
 */
export async function savePage({
  content,
  url,
}: {
  content: string;
  url: string;
}): Promise<void> {
  console.log('Saving page to Memoire');
  await memoire.ingest.raw({
    documents: [
      {
        content,
        documentID: await getUnsafeHash({ string: url }),
        metadata: {
          originalUrl: url,
        },
      },
    ],
  });
  console.log('Saved page to Memoire');
}

/**
 * Set the url status
 * @param root named parameters
 * @param root.url the url to save
 * @param root.status the status of the crawling
 */
export async function setUrlStatus({
  status,
  url,
}: {
  status: 'blocked' | 'crawled' | 'failed' | 'not found';
  url: string;
}): Promise<void> {
  console.log(`Set url status to ${status}`);
  urlQueue.set(url, status);
}
