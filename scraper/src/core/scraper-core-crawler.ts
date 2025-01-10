// libs
import { NodeHtmlMarkdown } from 'node-html-markdown';

// agents
import { extractRedundantData } from '../agents/scraper-agents-extract.js';

// browser
import { getBody, navigate } from '../browser/scraper-browser.js';

// storage
import {
  exportUrls,
  getNextUrl,
  savePage,
  setUrlAsCrawled,
  setUrlAsFailed,
} from '../storage/scraper-storage-interface.js';

/**
 * Crawl a domain from a given url until all the urls have been scraped
 * @param root named parameters
 * @param root.url the url to start crawling from
 */
export async function crawl({ url }: { url: string }): Promise<void> {
  // first step is to create a sample, and extract duplicated data
  const sample: { [key: string]: string } = {};
  for (let iteration = 0; iteration < 10; iteration++) {
    await navigate({ url });
    const content = await scrape();
    if (content) {
      sample[url] = content;
    } else {
      await setUrlAsFailed({ url });
    }
  }
  const redundantData = await extractRedundantData({
    sample: Object.values(sample),
  });
  // for each page in the sample, clean them and store them

  // then we simply extract every url sequentially until there are no more
  let nextUrl: string | undefined = url;
  while (nextUrl) {
    await navigate({ url: nextUrl });
    const markdown = await scrape();
    if (markdown) {
      const content = await clean({ markdown, redundantData });
      if (content) {
        await savePage({ content, url: nextUrl });
        await setUrlAsCrawled({ url: nextUrl });
        nextUrl = await getNextUrl();
        continue;
      }
    }
    await setUrlAsFailed({ url: nextUrl });
    nextUrl = await getNextUrl();
  }

  const report = exportUrls();
  console.log(report);
}

/**
 * Remove strings from a text
 * @param root named parameters
 * @param root.markdown the markdown to clean
 * @param root.redundantData A list of strings to remove from the markdown
 * @returns the cleaned text
 */
async function clean({
  markdown,
  redundantData,
}: {
  markdown: string;
  redundantData: string[];
}): Promise<string | undefined> {
  throw new Error('Not implemented');
}

/**
 * Scrape an url
 * @param root named parameters
 * @param root.url the url to scrape
 * @returns the markdown of the page
 */
async function scrape(): Promise<string | undefined> {
  const html = await getBody();
  const markdown = NodeHtmlMarkdown.translate(html);
  const clean = markdown
    // replace duplicate characters, avoid letter, numbers and slashes https://regex101.com/r/ufaBTA/1
    .replaceAll(/([^\d()/A-Za-z])\1+/g, '$1')
    .trim();
  return clean.replaceAll(/ +/g, ' ').trim();
}

async function processLinks(): Promise<void> {}
