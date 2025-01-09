// libs
import { readFile } from 'node:fs/promises';
import { describe, test } from 'vitest';

// function to test
import { agenticJobAdvertExtractor } from '../scraping-extractors-agentic-job-advert.js';

const ad1 = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/adverts/ad1.md',
  'utf8',
);
const ad2 = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/adverts/ad2.md',
  'utf8',
);
const ad3 = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/adverts/ad3.md',
  'utf8',
);

describe('Agentic job board extractor', async () => {
  test('advert 1 is correctly extracted', async () => {
    const result = await agenticJobAdvertExtractor({ webpage: ad1 });
    if (!result) {
      throw new Error('Test failed response was undef');
    }

    console.log(result);
  }, 200_000);

  test('advert 2 is correctly extracted', async () => {
    const result = await agenticJobAdvertExtractor({ webpage: ad2 });
    if (!result) {
      throw new Error('Test failed response was undef');
    }

    console.log(result);
  }, 200_000);

  test('advert 3 is correctly extracted', async () => {
    const result = await agenticJobAdvertExtractor({ webpage: ad3 });
    if (!result) {
      throw new Error('Test failed response was undef');
    }

    console.log(result);
  }, 200_000);
});
