import { describe, expect, test } from 'vitest';

// functions to test
import { MemoireClient } from '../../../index.js';

if (!process.env.MEMOIRE_API_KEY) {
  throw new Error('Please set the MEMOIRE_API_KEY env variable');
}
if (!process.env.MEMOIRE_URL) {
  throw new Error('Please set the MEMOIRE_URL env variable');
}

export const memoire = MemoireClient({
  apiKey: process.env.MEMOIRE_API_KEY,
  memoireUrl: process.env.MEMOIRE_URL,
});

describe('Memoire client', async () => {
  test('ingest raw', async () => {
    await memoire.ingest.raw({
      documents: [
        {
          content: 'this is a test content',
          documentID: '1234',
          metadata: {
            test: 'data',
          },
          title: 'test title',
        },
        {
          content: 'this is a second test',
          documentID: '5678',
        },
      ],
    });
  });

  test('search', async () => {
    const results = await memoire.search({ query: 'test' });
    console.log(results);
    expect(results.length).toBe(2);
  });

  test('delete', async () => {
    await memoire.delete({
      documentIDs: ['1234', '5678'],
    });
  });
});
