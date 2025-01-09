// libs
import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';

// function to test
import {
  linkExtractionAgent,
  // linkFilterAgent,
  // linkSummaryAgent,
} from '../scraping-extractors-agents-links.js';

const ad1 = await readFile(
  'scraper/src/extractors/agents/test/testfiles/adverts/ad1.md',
  'utf8',
);
const ad3 = await readFile(
  'scraper/src/extractors/agents/test/testfiles/adverts/ad3.md',
  'utf8',
);

const ad4 = await readFile(
  'scraper/src/extractors/agents/test/testfiles/adverts/ad4.md',
  'utf8',
);

describe('Agentic further links extractor', async () => {
  test('advert 1 is correctly extracted', async () => {
    const result = await linkExtractionAgent({ webpage: ad1 });
    if (!result) {
      throw new Error('Test failed response was undef');
    }

    console.log(result);
  }, 200_000);

  test('advert 3 is correctly extracted', async () => {
    const result = await linkExtractionAgent({ webpage: ad3 });
    if (!result) {
      throw new Error('Test failed response was undef');
    }

    console.log(result);

    expect(result.length).toBeGreaterThanOrEqual(20);
  }, 200_000);

  test('advert 4 is correctly extracted', async () => {
    const result = await linkExtractionAgent({ webpage: ad4 });
    if (!result) {
      throw new Error('Test failed response was undef');
    }

    console.log(result);

    // expect(result.length).toBeGreaterThanOrEqual(20);
  }, 200_000);
});

// describe('Summary of links agent', async () => {
//   // test('advert 1', async () => {
//   //   const result = await linkSummaryAgent({ webpage: ad1 });
//   //   if (!result) {
//   //     throw new Error('Test failed response was undef');
//   //   }

//   //   console.log(result);
//   // }, 200_000);

//   test('advert 3', async () => {
//     const result = await linkSummaryAgent({ webpage: ad3 });
//     if (!result) {
//       throw new Error('Test failed response was undef');
//     }

//     console.log(result);

//     const filtered = await linkFilterAgent({ linksSummary: result });
//     if (!filtered) {
//       throw new Error('Test failed filter response was undef');
//     }

//     console.log(filtered);
//   }, 200_000);
// });
