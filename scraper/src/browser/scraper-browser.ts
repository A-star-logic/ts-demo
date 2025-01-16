// node
import { URL } from 'node:url';

// libs
import { type Browser, launch, type Page } from 'puppeteer';
import { dateDifference, sleep } from '../utils/scraper-utils-time.js';

let browser: Browser;
let page: Page;
let lastMove: Date | undefined;

/**
 * Close the browser
 */
export async function closeBrowser(): Promise<void> {
  console.log('Closing browser');
  await browser.close();
  console.log('Browser closed');
}

/**
 * Get the content of the body, cleaned from any style and scripts
 * @returns the body cleaned from style and scripts
 */
export async function getBody(): Promise<string | undefined> {
  console.log('Extracting body');
  const frames = page.frames();
  try {
    const output = await Promise.all(
      frames.map(async (frame) => {
        if (!frame.url() || frame.url().length <= 12) {
          const something = await frame.evaluate(() => {
            return document;
          });
          console.log(something); // todo: it seems this is the case for youtube embed
          return undefined;
        }

        const origin = new URL(frame.url()).origin;
        try {
          const bodyContent = await frame.evaluate(() => {
            // replace relative urls by static ones
            const aTags = document.querySelectorAll('a[href]');
            aTags.forEach((aTag) => {
              const href = aTag.getAttribute('href');
              if (!href?.startsWith('http') && href) {
                if (href.startsWith('/')) {
                  aTag.setAttribute('href', origin + href);
                } else {
                  aTag.setAttribute('href', origin + '/' + href);
                }
              }
            });
            // remove svg elements and images
            const svgElements = document.querySelectorAll('svg');
            svgElements.forEach((svg) => {
              svg.remove();
            });
            const images = document.querySelectorAll('img');
            images.forEach((image) => {
              image.remove();
            });

            return document.body.innerHTML;
          });

          return bodyContent;
        } catch (error) {
          console.error('framesToString error:', error);
          return undefined;
        }
      }),
    );
    const filteredOutput = output.filter((element) => {
      return element !== undefined;
    });

    console.log('Body extracted');
    return filteredOutput.join(' ');
  } catch (error) {
    console.error('getBody error:', error);
    return undefined;
  }
}

/**
 * Get the links and their text or aria label
 * @param root named parameters
 * @param root.domainFilter filter the links by domain
 * @returns the body cleaned from style and scripts
 */
export async function getLinks({
  domainFilter,
}: {
  domainFilter: string | undefined;
}): Promise<
  | undefined
  | {
      [href: string]: string | undefined;
    }
> {
  console.log('Getting links');
  try {
    const aTags = await page.$$('a');
    const linkInfo: { [href: string]: string | undefined } = {};
    for (const aTag of aTags) {
      const href = await aTag.evaluate((element) => {
        return element.href;
      });
      const cleanedHref = cleanHref({ href });

      const innerText = await aTag.evaluate((element) => {
        return element.textContent;
      });

      const ariaLabel = await aTag.evaluate((element) => {
        return element.getAttribute('aria-label');
      });

      if (domainFilter && !href.includes(domainFilter)) {
        continue;
      }
      linkInfo[cleanedHref] =
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- the logic does not work with nullish coalescing and 0 length strings
        innerText?.trim() || ariaLabel?.trim() || undefined;
    }
    console.log(`Found ${Object.keys(linkInfo).length} links`);
    return linkInfo;
  } catch (error) {
    console.error('getLinks error:', error);
    return undefined;
  }
}

/**
 * Init the browser
 * @returns A browser page
 */
export async function initBrowser(): Promise<void> {
  console.log('Starting browser');

  // Launch a headless browser instance
  browser = await launch({
    headless: true, // Set to false if you want to see the browser UI
    // args: ['--no-sandbox', '--disable-setuid-sandbox'], // Useful for deployment environments like Docker
  });

  page = await browser.newPage();
  await page.setViewport({ height: 1080, width: 1920 });

  console.log('Browser ready');
}

/**
 * Instruct the browser to navigate to a url
 * @param root named parameters
 * @param root.url the url to navigate to
 * @returns true if the page loaded without issue, false otherwise
 */
export async function navigate({ url }: { url: string }): Promise<boolean> {
  if (lastMove !== undefined) {
    const diff = await dateDifference({ end: new Date(), start: lastMove });
    if (diff < 4) {
      // wait at least 4 seconds between navigation
      const ms = 4000 - diff * 1000;
      console.log(`waiting for ${ms}`);
      await sleep({ ms });
    }
  }

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      console.log(`Navigating to ${url}, tentative ${attempts}`);
      // Navigate to the target URL and wait for the page to load
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      console.log(`Loaded ${url} successfully`);
      lastMove = new Date();
      return true;
    } catch (error) {
      // @ts-expect-error don't care
      console.error(`Error navigating to ${url}: ${error.message}`);
      attempts++;
      if (attempts < maxAttempts) {
        const wait = attempts * 2000;
        console.log(`Retrying in ${wait} seconds...`);
        await sleep({ ms: wait });
      }
    }
  }

  console.error(`Failed to navigate to ${url} after ${maxAttempts} attempts`);
  return false;
}

/**
 * Clean an href from fragments and trailing slashes
 * @param root named parameters
 * @param root.href the href to clean
 * @returns the url cleaned
 */
function cleanHref({ href }: { href: string }): string {
  if (href.length > 0) {
    const hrefWithoutFragment = href.split('#')[0];
    try {
      if (new URL(hrefWithoutFragment).pathname === '/') {
        return hrefWithoutFragment.slice(0, -1);
      }
    } catch {
      console.log('url: ' + href);
      console.log(hrefWithoutFragment);
    }
    return hrefWithoutFragment;
  }
  return href;
}
