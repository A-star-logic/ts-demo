// types
import type { JobBoardExtractorOutput } from './scraping-extractors-model.js';

// extractor agents
import {
  agenticPageTypeDetection,
  agenticSummary,
} from './agents/scraping-extractor-agentic-classifier.js';
import { agenticJobAdvertExtractor } from './agents/scraping-extractors-agentic-job-advert.js';
import { agenticJobBoardExtractor } from './agents/scraping-extractors-agentic-job-board.js';
import { linkExtractionAgent } from './agents/scraping-extractors-agents-links.js';

/**
 * Detect if the page is a job board, a job advert, or not interesting.
 *
 * If the page is not interesting, the AI will try to extract furtherSearch, which is a list of urls to check out.
 * @param root named parameters
 * @param root.markdown the markdown of the page
 * @param root.url the url to check
 * @returns the type of the page, and if this is not an interesting page, potential other urls to check out
 */
export async function detectPageType({
  markdown,
  url,
}: {
  markdown: string;
  url: string;
}): Promise<
  | undefined
  | {
      detectedType: 'blocked' | 'jobAdvert' | 'jobBoard' | 'notInteresting';
      summary: string;
    }
> {
  console.log('Detecting content on ' + url);
  const summary = await agenticSummary({ webpage: markdown });
  if (!summary) {
    return undefined;
  }

  const detectedType = await agenticPageTypeDetection({
    summary,
  });

  if (!detectedType) {
    return undefined;
  }

  return {
    detectedType,
    summary,
  };
}

/**
 * Extract a list of potentially interesting links from a given page.
 * @param root named parameters
 * @param root.markdown the markdown of the page extracted and cleaned
 * @param root.url the url of the page
 * @returns the list of links or undefined if there was an error
 */
export async function extractInterestingLinks({
  markdown,
  url,
}: {
  markdown: string;
  url: string;
}): Promise<string[] | undefined> {
  console.log('Extracting urls from ' + url);
  return linkExtractionAgent({ webpage: markdown });
}

/**
 * Extract job advert content from a given url.
 * @param root named parameters
 * @param root.markdown the markdown of the page extracted and cleaned
 * @param root.url the url of the page
 * @returns the content as a json object
 */
export async function extractJobAdvert({
  markdown,
  url,
}: {
  markdown: string;
  url: string;
}): Promise<string | undefined> {
  console.log('Extracting job advert from ' + url);
  const content = await agenticJobAdvertExtractor({ webpage: markdown });
  return content;
}

/**
 * Extract job board content from a given url.
 * @param root named parameters
 * @param root.markdown the markdown of the page extracted and cleaned
 * @param root.url the url of the page
 * @returns an url for the next page to crawl, and a list of urls to check out later. nextPage is undefined if there are no more pages to crawl.
 */
export async function extractJobBoard({
  markdown,
  url,
}: {
  markdown: string;
  url: string;
}): Promise<JobBoardExtractorOutput | undefined> {
  console.log('Extracting urls from ' + url);
  return agenticJobBoardExtractor({ webpage: markdown });
}
