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
  getNextUrl,
  savePage,
  setUrlStatus,
} from '../storage/scraper-storage-interface.js';

/**
 * Crawl a domain from a given url until all the urls have been scraped
 * @param root named parameters
 * @param root.urls the urls to start crawling from
 */
export async function crawl({ urls }: { urls: string[] }): Promise<void> {
  await addUrlsToCrawlList({ urls });
  const domain = new URL(urls[0]).host;

  let url = await getNextUrl();
  while (url) {
    const carryOn = await navigate({ url });
    if (!carryOn) {
      await setUrlStatus({ status: 'failed', url });
      url = await getNextUrl();
      continue;
    }

    const markdown = await scrape();
    if (!markdown) {
      await setUrlStatus({ status: 'failed', url });
      url = await getNextUrl();
      continue;
    }

    const status = await detectPageStatus({ markdown });
    if (status !== 'valid') {
      await setUrlStatus({ status, url });
      url = await getNextUrl();
      continue;
    }

    const content = await extractRelevantData({ markdown });
    if (content) {
      await savePage({ content, url });
      await setUrlStatus({ status: 'crawled', url });
    } else {
      await setUrlStatus({ status: 'failed', url });
    }

    const hardLinks = await getLinks({ domainFilter: domain });
    if (!hardLinks) {
      await setUrlStatus({ status: 'failed', url });
      url = await getNextUrl();
      continue;
    }
    await addUrlsToCrawlList({ urls: Object.keys(hardLinks) });

    url = await getNextUrl();
  }
}

/**
 * Scrape an url, clean the content and return a markdown string with only the interesting information
 * @returns the markdown of the page
 */
async function scrape(): Promise<string | undefined> {
  const html = await getBody();
  if (!html) {
    return undefined;
  }

  const markdown = NodeHtmlMarkdown.translate(html);
  const clean = markdown
    // replace duplicate characters, avoid letter, numbers and slashes https://regex101.com/r/ufaBTA/1
    .replaceAll(/([^\d()/A-Za-z])\1+/g, '$1')
    .trim();
  return clean.replaceAll(/ +/g, ' ').trim();
}
