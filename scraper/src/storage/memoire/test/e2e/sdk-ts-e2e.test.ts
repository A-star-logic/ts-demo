import { describe, expect, test } from 'vitest';

// functions to test
import { memoire } from '../../index.js';

describe('Memoire client', async () => {
  test('ingest raw', async () => {
    await memoire.ingestRaw({
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
