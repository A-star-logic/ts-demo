// browser
import { getBody, navigate, page } from './browser/scraper-browser.js';

// extractor
import { htmlToMarkdown } from './extractors/scraping-extractor-html-to-md.js';
import {
  detectPageType,
  extractJobAdvert,
  extractJobBoard,
} from './extractors/scraping-extractors.js';

// storage
import {
  addSummaryToUrl,
  bulkInsertUrls,
} from './storage/d1/scraper-storage-d1.js';
import { memoire } from './storage/memoire/index.js';
import {
  savePage,
  setUrlAsCrawled,
} from './storage/scraper-storage-interface.js';

// utils
import { getUnsafeHash } from './utils/scraper-utils-crypto.js';

/**
 * Start scraping an url
 * @param root named parameters
 * @param root.url the url to scrape
 * @param root.urlType the type of the url if known
 */
export async function scrape({
  url,
  urlType,
}: {
  url: string;
  urlType: 'jobAdvert' | 'jobBoard' | 'unknown';
}): Promise<void> {
  await navigate({ url });
  // handle any redirect or changes in the url
  const actualUrl = page.url();
  let actualUrlType = urlType;
  if (actualUrl !== url) {
    await setUrlAsCrawled({
      url,
      urlType: 'notInteresting',
    });
    actualUrlType = 'unknown';
    // delete the previous url from memoire if it was a job posting
    if (urlType === 'jobAdvert') {
      await memoire.delete({
        documentIDs: [await getUnsafeHash({ string: url })],
      });
    }
  }

  const body = await getBody();
  const markdown = await htmlToMarkdown({ html: body });

  if (actualUrlType === 'unknown') {
    const pageDetection = await detectPageType({ markdown, url });
    if (!pageDetection) {
      throw new Error('Page detection failed');
    }
    const { detectedType, summary } = pageDetection;
    console.log('Detected as ' + detectedType);
    console.log('Adding summary to ' + url);
    await addSummaryToUrl({ id: url, summary });

    if (detectedType === 'jobAdvert' || detectedType === 'jobBoard') {
      actualUrlType = detectedType; // override the urlType so the rest of the code will pick it up
    }
    if (detectedType === 'notInteresting') {
      await setUrlAsCrawled({ url, urlType: detectedType });
      // todo: do further search, to find other urls to crawl
    }
  }

  if (actualUrlType === 'jobBoard') {
    await crawlJobBoard({ initialBody: body, initialUrl: actualUrl });
    await setUrlAsCrawled({ url: actualUrl, urlType: 'jobBoard' });
  }

  if (actualUrlType === 'jobAdvert') {
    const content = await extractJobAdvert({
      markdown,
      url: actualUrl,
    });
    if (!content) {
      throw new Error('Job advert extraction failed');
    }
    await savePage({ content, url });
    await setUrlAsCrawled({ url, urlType: 'jobAdvert' });
  }
}

/**
 * Crawl the job board until all the outbound urls have been scraped.
 *
 * It will stop when all the urls are already in the database, or if the postings show signs of being older than 2 months.
 * @param root named parameters
 * @param root.initialBody the body already extracted from the initial url
 * @param root.initialUrl the initial url to start scraping from
 */
async function crawlJobBoard({
  initialBody,
  initialUrl,
}: {
  initialBody: string;
  initialUrl: string;
}): Promise<void> {
  let urlToCrawl: string | undefined = initialUrl;
  let bodyCrawled = initialBody;
  while (urlToCrawl) {
    // the crawler is already on the first page, so we skip it
    if (urlToCrawl !== initialUrl) {
      await navigate({ url: urlToCrawl });
      bodyCrawled = await getBody();
    }

    const extracted = await extractJobBoard({
      markdown: await htmlToMarkdown({ html: bodyCrawled }),
      url: urlToCrawl,
    });
    if (!extracted) throw new Error('Job board extraction failed');

    const { nextPage, urlsExtracted } = extracted;
    await bulkInsertUrls({
      urls: urlsExtracted.map((url) => {
        return {
          crawlerID: null,
          id: url.url,
          lastCrawl: null,
          urlType: 'unknown',
        };
      }),
    });

    // todo choose between continuing or stopping here

    urlToCrawl = nextPage;
  }
}
