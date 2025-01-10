// node
import { readFile } from 'node:fs/promises';

// libs
import { describe, expect, test } from 'vitest';

// function to test
import {
  detectPageStatus,
  extractRelevantData,
} from '../scraper-agents-extract.js';

const notFound = await readFile(
  'scraper/src/agents/test/samples/404.md',
  'utf8',
);

const notFoundAlt = await readFile(
  'scraper/src/agents/test/samples/404_alt.md',
  'utf8',
);

const blocked = await readFile(
  'scraper/src/agents/test/samples/blocked.md',
  'utf8',
);

const valid = await readFile(
  'scraper/src/agents/test/samples/codeRepo.md',
  'utf8',
);

const documentation = await readFile(
  'scraper/src/agents/test/samples/documentation.md',
  'utf8',
);

const pricingPage = await readFile(
  'scraper/src/agents/test/samples/pricingPage.md',
  'utf8',
);

describe('Detect page status', async () => {
  test('404', async () => {
    const result = await detectPageStatus({ markdown: notFound });
    expect(result).toBe('not found');
  });

  test('404 alt', async () => {
    const result = await detectPageStatus({ markdown: notFoundAlt });
    expect(result).toBe('not found');
  });

  test('Blocked', async () => {
    const result = await detectPageStatus({ markdown: blocked });
    expect(result).toBe('blocked');
  });

  test('valid', async () => {
    const result = await detectPageStatus({ markdown: valid });
    expect(result).toBe('valid');
  });
});

describe('Extract relevant data', async () => {
  test('Code repository', async () => {
    const result = await extractRelevantData({ markdown: valid });
    console.log(result);
  }, 200_000);

  test('Documentation', async () => {
    const result = await extractRelevantData({ markdown: documentation });
    console.log(result);
  }, 200_000);

  test('Pricing page', async () => {
    const result = await extractRelevantData({ markdown: pricingPage });
    console.log(result);
  }, 200_000);
});
