// libs
import { NodeHtmlMarkdown } from 'node-html-markdown';

// agents
import {
  detectPageStatus,
  extractRelevantData,
} from '../agents/scraper-agents-extract.js';

// browser
import { getBody, getLinks, navigate } from '../browser/scraper-browser.js';

// storage
import {
  addUrlsToCrawlList,
  exportUrls,
  getNextUrl,
  savePage,
  setUrlAsBlocked,
  setUrlAsCrawled,
  setUrlAsFailed,
  setUrlAsNotFound,
} from '../storage/scraper-storage-interface.js';

/**
 * Crawl a domain from a given url until all the urls have been scraped
 * @param root named parameters
 * @param root.urls the urls to start crawling from
 */
export async function crawl({ urls }: { urls: string[] }): Promise<void> {
  await addUrlsToCrawlList({ urls });
  const domain = new URL(urls[0]).host;

  let nextUrl = await getNextUrl();
  while (nextUrl) {
    await navigate({ url: nextUrl });

    const markdown = await scrape();
    const status = await detectPageStatus({ markdown });
    switch (status) {
      case 'blocked': {
        await setUrlAsBlocked({ url: nextUrl });
        break;
      }
      case 'not found': {
        await setUrlAsNotFound({ url: nextUrl });
        break;
      }
      case undefined: {
        await setUrlAsFailed({ url: nextUrl });
        break;
      }
    }

    if (status === 'valid') {
      const content = await extractRelevantData({ markdown });
      if (content) {
        await savePage({ content, url: nextUrl });
        await setUrlAsCrawled({ url: nextUrl });
      } else {
        await setUrlAsFailed({ url: nextUrl });
      }
    }

    await processLinks({ domain });

    nextUrl = await getNextUrl();
  }

  const report = exportUrls();
  console.log(report);
}

/**
 * Process all the links from the current page, and attempt to find new ones that may not be "links" such as buttons
 * @param root named parameters
 * @param root.domain the domain to keep the crawler on
 */
export async function processLinks({
  domain,
}: {
  domain: string;
}): Promise<void> {
  const hardLinks = await getLinks({ domainFilter: domain });
  await addUrlsToCrawlList({ urls: Object.keys(hardLinks) });
}

/**
 * Scrape an url, clean the content and return a markdown string with only the interesting information
 * @returns the markdown of the page
 */
async function scrape(): Promise<string> {
  const html = await getBody();
  const markdown = NodeHtmlMarkdown.translate(html);
  const clean = markdown
    // replace duplicate characters, avoid letter, numbers and slashes https://regex101.com/r/ufaBTA/1
    .replaceAll(/([^\d()/A-Za-z])\1+/g, '$1')
    .trim();
  return clean.replaceAll(/ +/g, ' ').trim();
}
