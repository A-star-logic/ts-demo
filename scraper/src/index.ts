// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- not needed here
/* eslint-disable unicorn/no-process-exit -- this is a CLI application */
// node
import { writeFile } from 'node:fs/promises';

// browser
import { closeBrowser, initBrowser } from './browser/scraper-browser.js';
import { crawl } from './core/scraper-core-crawler.js';
import { exportUrls } from './storage/scraper-storage-interface.js';

let report: { [key: string]: string | undefined } = {};

/**
 * take care of the server exiting
 * @param code the exit code
 */
export async function handleExit(code: number): Promise<void> {
  try {
    console.info(`Attempting a graceful shutdown with code ${code}`);

    await writeFile('report.json', JSON.stringify(report));
    await closeBrowser();
    process.exit(code);
  } catch (error) {
    console.error(error, 'Error shutting down gracefully');
    console.error(`Forcing exit with code ${code}`);
    process.exit(code);
  }
}

process.on('unhandledRejection', (reason: Error) => {
  const message = `Unhandled Rejection: ${reason instanceof Error ? reason.message : reason}`;
  console.error(reason, message);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises -- no need here
  handleExit(1);
});

process.on('uncaughtException', (error: Error) => {
  const message = `Uncaught Exception: ${error.message}`;
  console.error(error, message);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises -- no need here
  handleExit(1);
});
process.on('SIGTERM', () => {
  console.info(`Process ${process.pid} received SIGTERM: Exiting with code 0`);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises -- no need here
  handleExit(0);
});
process.on('SIGINT', () => {
  console.info(`Process ${process.pid} received SIGINT: Exiting with code 0`);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises -- no need here
  handleExit(0);
});

await initBrowser();

try {
  await crawl({ urls: ['https://www.ycombinator.com/interviews'] });
} catch (error) {
  console.error(error);
}
report = exportUrls();
console.log('report:');
console.log(report);
await writeFile('report.json', JSON.stringify(report));

await closeBrowser();
