import { describe, expect, test } from 'vitest';

// functions to test
import {
  addSummaryToUrl,
  bulkDeleteUrls,
  bulkInsertUrls,
  deleteCrawler,
  getUrlsById,
  updateUrl,
  upsertCrawler,
} from '../scraper-storage-d1.js';

/*

warning
those tests are running on a persistent DB and manually checked to learn verify how the rest API works.

To do proper tests, ensure:

- There is an offline DB
- The DB is reset at every test
- Adapt the tests to a DB that is reset on every test (eg: recreate data on the fly)
- Read the rows to ensure CRUD works

*/

describe('crawlers', () => {
  test('Creating a crawler ID', async () => {
    await upsertCrawler({ crawlerID: 'test' });
  });
});

describe('urls', () => {
  test('creating bulk of urls', async () => {
    await bulkInsertUrls({
      urls: [
        {
          crawlerID: 'test',
          id: 'https://test.com',
          lastCrawl: null,
          urlType: 'unknown',
        },
        {
          crawlerID: null,
          id: 'https://test2.com',
          lastCrawl: Date.now(),
          urlType: 'jobAdvert',
        },
        {
          crawlerID: null,
          id: 'https://test3.com',
          lastCrawl: Date.now(),
          urlType: 'notInteresting',
        },
        {
          crawlerID: null,
          id: 'https://test4.com',
          lastCrawl: Date.now(),
          urlType: 'jobBoard',
        },
      ],
    });
    await bulkInsertUrls({
      urls: [
        {
          crawlerID: null,
          id: 'https://test.com',
          lastCrawl: null,
          urlType: 'unknown',
        },
      ],
    });
  }, 200_000);

  test('update summary', async () => {
    await addSummaryToUrl({ id: 'https://test.com', summary: 'test summary' });
  }, 200_000);

  test('Get urls by ID', async () => {
    const urls = await getUrlsById({
      ids: ['https://test.com', 'https://test2.com'],
    });
    expect(urls.length).toBe(2);

    const urlMeta0 = urls[0];
    const urlMeta1 = urls[1];

    expect(urlMeta0.crawlerID).toEqual('test');
    expect(urlMeta0.lastCrawl).toBeNull();
    expect(urlMeta0.urlType).toEqual('unknown');
    expect(urlMeta0.summary).toBe('test summary');

    expect(urlMeta1.crawlerID).toBeNull();
    expect(urlMeta1.lastCrawl).not.toBeNull();
    expect(urlMeta1.urlType).toEqual('jobAdvert');
    expect(urlMeta1.summary).toBeNull();
  }, 200_000);

  test("urls that don't exists return undefined", async () => {
    const urlMeta = await getUrlsById({ ids: ['this should not exist'] });
    expect(urlMeta.length).toBe(0);
  }, 200_000);

  test('update url', async () => {
    await updateUrl({
      urlMeta: {
        crawlerID: null,
        id: 'https://test.com',
        lastCrawl: Date.now(),
        urlType: 'jobAdvert',
      },
    });

    const urlMeta = await getUrlsById({ ids: ['https://test.com'] });
    expect(urlMeta[0].crawlerID).toBeNull();
    expect(urlMeta[0].lastCrawl).not.toBeNull();
    expect(urlMeta[0].id).toEqual('https://test.com');
    expect(urlMeta[0].urlType).toEqual('jobAdvert');
  }, 200_000);

  test('bulk delete urls', async () => {
    await bulkDeleteUrls({
      urlIDs: [
        'https://test.com',
        'https://test2.com',
        'https://test3.com',
        'https://test4.com',
      ],
    });
  });
});

test('Deleting a crawler ID', async () => {
  await deleteCrawler({ crawlerID: 'test' });
}, 200_000);
