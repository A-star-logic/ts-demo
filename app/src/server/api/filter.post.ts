// libs
import { JSONPrompt } from '@demo-pkg/llm/llm-prompts.ts';
import { completions } from '@demo-pkg/llm/models/index.ts';

import { createError, defineEventHandler, readBody } from 'h3';

import type { PostSearchResponse } from './search.post.js';

export interface FilterDocumentsBody {
  intent: string;
  queries: string[];
  searchResult: PostSearchResponse[number];
}
export interface FilterDocumentsResponse {
  decision: 'not relevant' | 'relevant';
}

export default defineEventHandler(async (event) => {
  const body = await readBody<FilterDocumentsBody>(event);

  if (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we are specifically planning for empty requests
    !body.searchResult ||
    !body.intent ||
    body.intent.length === 0 ||
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we are specifically planning for empty requests
    !body.queries ||
    body.queries.length === 0
  ) {
    throw createError({
      message: 'Missing parameters for filter',
      statusCode: 422,
    });
  }

  const { reply } = await completions({
    messages: [
      {
        content: `
You will be given a user's intent, associated queries, and a document.

Your first goal is to find all the relevant information in this document that can answer the user's question.
Your second goal is to classify if this document is relevant or not (say "relevant" or "not relevant"), and explain your decision.
  `,
        role: 'system',
      },
      {
        content: `
The user's intent is: ${body.intent}
The user's queries are: ${body.queries.join(' ')}
The document:
${body.searchResult.content}
`,
        role: 'user',
      },
    ],
    model: 'gpt-4o-mini',
  });

  if (!reply) {
    throw createError({
      message: 'No reply',
      statusCode: 500,
    });
  }

  const { reply: classification } = await completions({
    json: true,
    messages: [
      {
        content: `
You will be given the output of another LLM.
Your task is to sort if the document is relevant or not based on their reasoning.

${JSONPrompt({ keys: '"decision":"relevant"|"not relevant"}' })}
  `,
        role: 'system',
      },
      {
        content: reply,
        role: 'user',
      },
    ],
    model: 'gpt-4o-mini',
  });
  if (!classification) {
    throw createError({
      message: 'No reply',
      statusCode: 500,
    });
  }
  try {
    const parsed = JSON.parse(classification) as FilterDocumentsResponse;
    return {
      decision: parsed.decision,
    } satisfies FilterDocumentsResponse;
  } catch (error) {
    console.error(error);
    throw createError({
      message: 'No reply',
      statusCode: 500,
    });
  }
});
