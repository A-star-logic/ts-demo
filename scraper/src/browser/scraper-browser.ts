// libs
import puppeteer, { type Browser, type Page } from 'puppeteer';

export let browser: Browser;
export let page: Page;

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
export async function getBody(): Promise<string> {
  const iframes = page.frames();

  // If there is an iframe with ashby, we can assume the other iframes can be discarded
  if (
    iframes.some((frame) => {
      return frame.url().includes('ashbyhq.com');
    })
  ) {
    return framesToString({ filter: 'ashbyhq.com', frames: iframes });
  }

  return framesToString({ frames: iframes });
}

/**
 * Take a screenshot of the current page
 *
 * **Important note!** Because the iframes are loaded at a different time than the page, you need to ensure either
 *
 * - Enough time has passed for the iframes to be loaded
 * - Or (better) use the `getBody` function, which will forces the iframes to be loaded
 * @returns a base 64 string of the screenshots
 */
export async function getScreenshot(): Promise<string> {
  console.log('Taking screenshot');
  return page.screenshot({
    encoding: 'base64',
    fullPage: true,
    path: 'screenshot.jpeg',
    type: 'jpeg',
  });
}

/**
 * Init the browser
 * @returns A browser page
 */
export async function initBrowser(): Promise<void> {
  console.log('Starting browser');

  // Launch a headless browser instance
  browser = await puppeteer.launch({
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
 */
export async function navigate({ url }: { url: string }): Promise<void> {
  console.log('Navigating to ' + url);
  // Navigate to the target URL and wait for the page to load
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  console.log('Loaded ' + url);
}

/**
 * Extract the content of the frames, optionally filter and keep only the specified urls.
 * @param root named parameters
 * @param root.filter an optional filter to apply to the urls
 * @param root.frames the frames to extract the content from
 * @returns an html string
 */
async function framesToString({
  filter,
  frames,
}: {
  filter?: string;
  frames: puppeteer.Frame[];
}): Promise<string> {
  const output = await Promise.all(
    frames.map(async (frame) => {
      if (filter && !frame.url().includes(filter)) return undefined;

      const origin = new URL(frame.url()).origin;
      try {
        const bodyContent = await frame.evaluate(() => {
          // replace relative urls by static ones
          const aTags = document.querySelectorAll('a[href]');
          aTags.forEach((aTag) => {
            const href = aTag.getAttribute('href');
            if (!href?.startsWith('http') && href) {
              aTag.setAttribute('href', origin + '/' + href);
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
  return filteredOutput.join(' ');
}
