// browser
import { closeBrowser, initBrowser } from './browser/scraper-browser.js';

await initBrowser();
// scrape
// do this for all current urls
await closeBrowser();
