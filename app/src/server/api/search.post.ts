// libs
import { MemoireClient } from '@astarlogic/sdk/memoire';
import { createError, defineEventHandler, readBody } from 'h3';

if (!process.env.MEMOIRE_API_KEY) {
  throw new Error('Please set the MEMOIRE_API_KEY env variable');
}
if (!process.env.MEMOIRE_URL) {
  throw new Error('Please set the MEMOIRE_URL env variable');
}

const memoire = MemoireClient({
  apiKey: process.env.MEMOIRE_API_KEY,
  memoireUrl: process.env.MEMOIRE_URL,
});

export interface PostSearchBody {
  queries: string[];
}
export type PostSearchResponse = Awaited<ReturnType<typeof memoire.search>>;

export default defineEventHandler(async (event) => {
  const body = await readBody<PostSearchBody>(event);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we are specifically planning for empty requests
  if (!body.queries || body.queries.length === 0) {
    throw createError({
      message: 'Queries are required',
      statusCode: 422,
    });
  }

  const searches = await Promise.all(
    body.queries.map(async (query) => {
      const results = await memoire.search({
        maxResults: 50,
        operationMode: 'speed',
        query,
      });
      return results;
    }),
  );

  const results = searches.flat();

  // Count duplicates todo: update this code with Memoire
  const duplicates = new Map<string, number>();
  for (const result of results) {
    const existingID = duplicates.get(result.documentID);
    if (existingID) {
      duplicates.set(result.documentID, existingID + 1);
    } else {
      duplicates.set(result.documentID, 1);
    }
  }

  // small additional re-rank
  for (const result of results) {
    const count = duplicates.get(result.documentID);
    if (!count) {
      console.error('no count', result);
      continue;
    }
    const factor = 1 + count / 10; // one occurrence is 1.1, two is 1.2, three is 1.3, etc
    result.score = result.score * factor;
  }

  // then remove duplicates, and keep only the highest score of each
  const uniqueResults = new Map<string, PostSearchResponse[number]>();
  for (const result of results) {
    const existing = uniqueResults.get(result.documentID);
    if (existing && result.score > existing.score) {
      uniqueResults.set(result.documentID, result);
    }
    if (!existing) {
      uniqueResults.set(result.documentID, result);
    }
  }

  // sort and return the results
  return [...uniqueResults.values()].sort((a, b) => {
    return b.score - a.score;
  }) satisfies PostSearchResponse;
});
