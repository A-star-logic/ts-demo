// libs
import { completions } from '@demo-pkg/llm/models/index.ts';
import { createError, defineEventHandler, readBody } from 'h3';

// types
import type { PostSearchResponse } from './search.post.js';

export interface SummarizeBody {
  intent: string;
  searchResults: PostSearchResponse;
}
export interface SummarizeResponse {
  summaries: (string | undefined)[];
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SummarizeBody>(event);

  if (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we are specifically planning for empty requests
    !body.searchResults ||
    body.searchResults.length === 0 ||
    !body.intent ||
    body.intent.length === 0
  ) {
    throw createError({
      message: 'Search is required',
      statusCode: 422,
    });
  }

  const summaries = await Promise.all(
    body.searchResults.map(async (result) => {
      const { reply } = await completions({
        messages: [
          {
            content: `
You will be given the user's intention, and a document in markdown.
Your first goal is to find all the relevant information in this document that can answer the user's question.
    
Your second goal is to try to answer the user's question using this information.
    
If there is no information in the document that can answer the user's question, reply with "There is no information."
      `,
            role: 'system',
          },
          {
            content: `
The user's intent: ${body.intent}
${result.content}
`,
            role: 'user',
          },
        ],
        model: 'gpt-4o',
      });
      return reply;
    }),
  );

  return { summaries } satisfies SummarizeResponse;
});
