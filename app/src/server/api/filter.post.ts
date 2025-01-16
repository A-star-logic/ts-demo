// libs
import { JSONPrompt } from '@demo-pkg/llm/llm-prompts.ts';
import { completions } from '@demo-pkg/llm/models/index.ts';

import { createError, defineEventHandler, readBody } from 'h3';

import type { PostSearchResponse } from './search.post.js';

export interface FilterDocumentsBody {
  intent: string;
  searchResults: PostSearchResponse;
}
export interface FilterDocumentsResponse {
  filtered: { classification: 'not relevant' | 'relevant'; id: string }[];
}

export default defineEventHandler(async (event) => {
  const body = await readBody<FilterDocumentsBody>(event);

  if (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we are specifically planning for empty requests
    !body.searchResults ||
    body.searchResults.length === 0 ||
    !body.intent ||
    body.intent.length === 0
  ) {
    throw createError({
      message: 'Missing parameters for filter',
      statusCode: 422,
    });
  }

  let documents = '';
  for (const result of body.searchResults) {
    // todo: this may need to be updated depending on the use case
    const relevantData = result.highlights ?? result.content;
    documents += `${result.documentID} --- ${relevantData.replaceAll(/[\n\r]+/g, '')}\n`;
  }

  const { reply } = await completions({
    messages: [
      {
        content: `
You will be given a user's intent and a list of results in the format ID --- content.
You need to verify for each result if it is relevant to the intent, and if the result has information that could answer it.
Explain your decision every time.

Your response will be formatted as:
ID1 --- relevant. your decision
ID2 --- not relevant. your decision

You do not need to add any other information or summary.
  `,
        role: 'system',
      },
      {
        content: `
The user's intent is: ${body.intent}

The documents are:

${documents}
`,
        role: 'user',
      },
    ],
    model: 'gpt-4o',
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
You will be given a list of results with opinions.
All those results will be in the format:
ID1 --- relevant. some text
ID2 --- not relevant. some text

Your task is to extract the IDs and their classification into a JSON object
${JSONPrompt({ keys: '"results":[{"id":"id","classification":"relevant"|"not relevant"}]' })}
  `,
        role: 'system',
      },
      {
        content: reply,
        role: 'user',
      },
    ],
    model: 'gpt-4o',
  });
  if (!classification) {
    throw createError({
      message: 'No reply',
      statusCode: 500,
    });
  }
  try {
    const parsed = JSON.parse(classification) as {
      results: FilterDocumentsResponse['filtered'];
    };
    return {
      filtered: parsed.results,
    } satisfies FilterDocumentsResponse;
  } catch (error) {
    console.error(error);
    throw createError({
      message: 'No reply',
      statusCode: 500,
    });
  }
});
