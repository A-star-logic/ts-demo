// libs
import { completions } from '@demo-pkg/llm/models/index.ts';
import { createError, defineEventHandler, readBody } from 'h3';

export interface BuildSearchesBody {
  search: string;
}
export interface BuildSearchesResponse {
  intent: string | undefined;
  proposedSearches: string[] | undefined;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<BuildSearchesBody>(event);

  if (!body.search) {
    throw createError({
      message: 'Search is required',
      statusCode: 422,
    });
  }

  const { reply: intent } = await completions({
    messages: [
      {
        content: `
  You will be given a query from a user.
  You goal is to create a summary of the intention of the user, this will be used by other LLMs to answer the user's question.
  You need to write only one sentence.
  `,
        role: 'system',
      },
      {
        content: body.search,
        role: 'user',
      },
    ],
    model: 'gpt-4o-mini',
  });

  const { reply } = await completions({
    messages: [
      {
        content: `
  You will be given a query from a user.
  Your goal is to create a list of search queries that might be more relevant to answer the user's question.

  Each of your propositions should be on a new line.
  You will create maximum four propositions.

  The queries should not be different from the user's original query, but simple re-wording that will improve the search quality.
  `,
        role: 'system',
      },
      {
        content: body.search,
        role: 'user',
      },
    ],
    model: 'gpt-4o-mini',
  });

  return {
    intent,
    proposedSearches: reply ? reply.split('\n') : undefined,
  } satisfies BuildSearchesResponse;
});
