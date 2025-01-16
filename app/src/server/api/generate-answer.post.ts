// libs
import { completions } from '@demo-pkg/llm/models/index.ts';
import { createError, defineEventHandler, readBody } from 'h3';

export interface GenerateAnswerBody {
  documents: string[];
  intent: string;
  query: string;
}
export interface GenerateAnswerResponse {
  reply: string | undefined;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<GenerateAnswerBody>(event);

  if (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we are specifically planning for empty requests
    !body.documents ||
    body.documents.length === 0 ||
    !body.intent ||
    body.intent.length === 0 ||
    !body.query ||
    body.query.length === 0
  ) {
    throw createError({
      message: 'Missing parameters for generate-answer',
      statusCode: 422,
    });
  }

  const { reply } = await completions({
    messages: [
      {
        content: `
You will be given the user's intention, and their queries.
You will also be given a list of summaries from relevant documents that may have the answer.

Your goal is to answer the user's request, and provide the most helpful information from the search.
Use exclusively the documents that have been provided to create your answer.
  `,
        role: 'system',
      },
      {
        content: `
The user's intent: ${body.intent}
The user's queries are: ${body.query}
The relevant documents are:
${body.documents.join('\n')}
`,
        role: 'user',
      },
    ],
    model: 'gpt-4o',
  });

  return { reply } satisfies GenerateAnswerResponse;
});
