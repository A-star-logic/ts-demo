import type { D1Url } from '../storage/d1/scraper-storage-d1-schemas.js';

export interface JobBoardExtractorOutput {
  /** The next url to crawl; is undefined when there is no more pages to crawl */
  nextPage: string | undefined;
  /** A list of urls to check out */
  urlsExtracted: {
    postedOn: number | undefined;
    url: string;
    urlType: D1Url['urlType'];
  }[];
}
