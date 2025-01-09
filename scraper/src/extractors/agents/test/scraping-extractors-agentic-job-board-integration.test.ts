import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { agenticJobBoardExtractor } from '../scraping-extractors-agentic-job-board.js';

const HNBoard = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/boards/HN.md',
  'utf8',
);
const svixBoard = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/boards/svix.md',
  'utf8',
);

const mindsdbBoard = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/boards/mindsdb.md',
  'utf8',
);

const board5 = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/boards/board5.md',
  'utf8',
);

describe('Agentic job board extractor', async () => {
  test('HN board will extract the right data', async () => {
    const result = await agenticJobBoardExtractor({ webpage: HNBoard });
    if (!result) {
      throw new Error('Test failed response was undef');
    }

    // console.log(JSON.stringify(result, null, 2));

    expect(result.nextPage).toBe(
      'https://news.ycombinator.com/jobs?next=42330812&n=31',
    );
    expect(result.urlsExtracted.length).toBe(30);
    for (const urlExtracted of result.urlsExtracted) {
      expect(urlExtracted.url).toBeDefined();
    }
  }, 200_000);

  test('svix board will extract the right data', async () => {
    const result = await agenticJobBoardExtractor({ webpage: svixBoard });
    if (!result) {
      throw new Error('Test failed response was undef');
    }

    expect(result.nextPage).toBe(null);
    expect(result.urlsExtracted.length).toBe(5);
    for (const urlExtracted of result.urlsExtracted) {
      expect(urlExtracted.url).toBeDefined();
      expect(urlExtracted.postedOn).toBeNull();
    }
  }, 200_000);

  test('mindsdb board will extract the right data', async () => {
    const result = await agenticJobBoardExtractor({ webpage: mindsdbBoard });
    if (!result) {
      throw new Error('Test failed response was undef');
    }

    expect(result.nextPage).toBe(null);
    expect(result.urlsExtracted.length).toBe(5);
    for (const urlExtracted of result.urlsExtracted) {
      expect(urlExtracted.url).toBeDefined();
      expect(urlExtracted.postedOn).toBeNull();
    }
  }, 200_000);

  test('empty board will return empty arrays', async () => {
    const result = await agenticJobBoardExtractor({ webpage: board5 });
    if (!result) {
      throw new Error('Test failed response was undef');
    }

    expect(result.nextPage).toBe(null);
    expect(result.urlsExtracted.length).toBe(0);
  }, 200_000);
});
