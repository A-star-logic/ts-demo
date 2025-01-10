// browser
import { closeBrowser, initBrowser } from './browser/scraper-browser.js';
import { crawl } from './core/scraper-core-crawler.js';

await initBrowser();

await crawl({ url: 'https://www.google.com' });

await closeBrowser();
