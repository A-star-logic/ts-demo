// D1 types
import type { D1Url } from './d1/scraper-storage-d1-schemas.js';

// utils
import { getUnsafeHash } from '../utils/scraper-utils-crypto.js';

// D1
import { getUrlsById, updateUrl } from './d1/scraper-storage-d1.js';

// libs
import { memoire } from './memoire/index.js';

/**
 * Filter the urls, and return only the urls that are NOT already in the database.
 *
 * This function will help determine on job boards if the crawler should look for the next page or stop
 * @param root named parameters
 * @param root.urls the url to check
 * @returns a list of urls that d
 */
export async function filterSavedUrls({
  urls,
}: {
  urls: string[];
}): Promise<string[]> {
  const urlsMeta = await getUrlsById({ ids: urls });

  if (urlsMeta.length === 0) {
    return urls;
  }
  if (urlsMeta.length === urls.length) {
    return [];
  }

  const urlsAsSet = new Set(urls);
  for (const urlInDB of urlsMeta) {
    urlsAsSet.delete(urlInDB.id);
  }

  return [...urlsAsSet];
}

/**
 * Mark the url as a job advert and indicate the current crawler is crawling it.
 *
 * **Note** This function should be called only on unknown urls
 * @param root named parameters
 * @param root.url the url to save
 * @param root.crawlerID the crawler ID
 */
export async function markUrlAsJobAdvert({
  crawlerID,
  url,
}: {
  crawlerID: string;
  url: string;
}): Promise<void> {
  const existingUrl = await getUrlsById({ ids: [url] });
  if (existingUrl.length > 0 && existingUrl[0].urlType === 'jobBoard') {
    return;
  }
  await updateUrl({
    urlMeta: {
      crawlerID,
      id: url,
      lastCrawl: null,
      urlType: 'jobAdvert',
    },
  });
}

/**
 * Save the url as a job board, indicating it can be regularly scraped in the future
 *
 * **Note** This function should be called only on unknown urls
 * @param root named parameters
 * @param root.url the url to save
 * @param root.crawlerID the crawler ID
 */
export async function markUrlAsJobBoard({
  crawlerID,
  url,
}: {
  crawlerID: string;
  url: string;
}): Promise<void> {
  const existingUrl = await getUrlsById({ ids: [url] });
  if (existingUrl.length > 0 && existingUrl[0].urlType === 'jobBoard') {
    return;
  }
  await updateUrl({
    urlMeta: {
      crawlerID,
      id: url,
      lastCrawl: null,
      urlType: 'jobBoard',
    },
  });
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
  await memoire.ingestRaw({
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
}

/**
 * Set the url as crawled, add a timestamp and set its type
 * @param root named parameters
 * @param root.url the url to save
 * @param root.urlType the url type
 */
export async function setUrlAsCrawled({
  url,
  urlType,
}: {
  url: string;
  urlType: D1Url['urlType'];
}): Promise<void> {
  await updateUrl({
    urlMeta: {
      crawlerID: null,
      id: url,
      lastCrawl: Date.now(),
      urlType,
    },
  });
}
