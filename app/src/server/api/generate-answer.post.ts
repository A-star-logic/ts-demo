// libs
import { completions } from '@demo-pkg/llm/models/index.ts';
import { createError, defineEventHandler, readBody } from 'h3';

export interface GenerateAnswerBody {
  intent: string;
  query: string;
  summaries: string[];
}
export interface GenerateAnswerResponse {
  reply: string | undefined;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<GenerateAnswerBody>(event);

  if (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we are specifically planning for empty requests
    !body.summaries ||
    body.summaries.length === 0 ||
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
You will be given the user's intention, and their query.
You will also be given a list of summaries from relevant documents that may have the answer.

Your goal is to answer the user's request, and provide the most helpful information from the search.

If there is no information in the document that can answer the user's question, reply with "There is no information."
  `,
        role: 'system',
      },
      {
        content: `
The user's intent: ${body.intent}
The user's query is: ${body.query}
The relevant documents are:
${body.summaries.join('\n')}
`,
        role: 'user',
      },
    ],
    model: 'gpt-4o',
  });

  return { reply } satisfies GenerateAnswerResponse;
});
