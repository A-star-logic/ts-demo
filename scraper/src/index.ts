// browser
import { closeBrowser, initBrowser } from './browser/scraper-browser.js';
import { crawl } from './core/scraper-core-crawler.js';

await initBrowser();

await crawl({ urls: ['http://localhost:3000'] });

await closeBrowser();
