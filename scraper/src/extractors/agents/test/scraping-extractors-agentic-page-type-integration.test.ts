// libs
import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';

// function to test
import { detectPageType } from '../../scraping-extractors.js';
import { agenticSummary } from '../scraping-extractor-agentic-classifier.js';

const error1 = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/other/404.md',
  'utf8',
);
const blocked1 = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/other/blocked1.md',
  'utf8',
);
const ad3 = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/adverts/ad3.md',
  'utf8',
);
const board = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/boards/svix.md',
  'utf8',
);
const homepage = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/other/homepage.md',
  'utf8',
);
const codeRepo = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/other/codeRepo.md',
  'utf8',
);
const blog = await readFile(
  'scraper/src/extractors/agentic/test/testfiles/other/interview-blog.md',
  'utf8',
);

describe('agentic summary', async () => {
  test('agentic summary: homepage', async () => {
    const result = await agenticSummary({
      webpage: homepage,
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
  }, 200_000);
  test('agentic summary: board', async () => {
    const result = await agenticSummary({
      webpage: board,
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
  }, 200_000);
  test('agentic summary: code repo', async () => {
    const result = await agenticSummary({
      webpage: codeRepo,
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
  }, 200_000);
  test('agentic summary: job advert', async () => {
    const result = await agenticSummary({
      webpage: ad3,
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
  }, 200_000);
  test('agentic summary: blocked page', async () => {
    const result = await agenticSummary({
      webpage: blocked1,
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
  }, 200_000);
  test('agentic summary: 404', async () => {
    const result = await agenticSummary({
      webpage: error1,
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
  }, 200_000);
  test('agentic summary: blog', async () => {
    const result = await agenticSummary({
      webpage: blog,
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
  }, 200_000);
});

describe('Type detection with CoT', async () => {
  test('Home page is detected as not interesting', async () => {
    const result = await detectPageType({
      markdown: homepage,
      url: 'home.url',
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
    expect(result.detectedType).toBe('notInteresting');
  }, 200_000);

  test('Error page is detected as not interesting', async () => {
    const result = await detectPageType({
      markdown: error1,
      url: 'error.url',
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
    expect(result.detectedType).toBe('notInteresting');
  }, 200_000);

  test('Blocked page is detected as blocked', async () => {
    const result = await detectPageType({
      markdown: blocked1,
      url: 'block.url',
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
    expect(result.detectedType).toBe('blocked');
  }, 200_000);

  test('advert page is detected as advert', async () => {
    const result = await detectPageType({
      markdown: ad3,
      url: 'advert.url',
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
    expect(result.detectedType).toBe('jobAdvert');
  }, 200_000);

  test('board page is detected as a board', async () => {
    const result = await detectPageType({
      markdown: board,
      url: 'board.url',
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
    expect(result.detectedType).toBe('jobBoard');
  }, 200_000);

  test('code repo is detected as not interesting', async () => {
    const result = await detectPageType({
      markdown: codeRepo,
      url: 'repo.url',
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
    expect(result.detectedType).toBe('notInteresting');
  }, 200_000);

  test('blog is detected as not interesting', async () => {
    const result = await detectPageType({
      markdown: blog,
      url: 'blog.url',
    });
    if (!result) {
      throw new Error('Test failed response was undef');
    }
    console.log(result);
    expect(result.detectedType).toBe('notInteresting');
  }, 200_000);
});
