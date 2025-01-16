// libs
import { completions } from '@demo-pkg/llm/models/index.ts';
import { createError, defineEventHandler, readBody } from 'h3';

export interface ExtractBody {
  document: string;
  intent: string;
  queries: string[];
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ExtractBody>(event);

  if (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we are specifically planning for empty requests
    !body.queries ||
    body.queries.length === 0 ||
    !body.intent ||
    body.intent.length === 0 ||
    !body.document ||
    body.document.length === 0
  ) {
    throw createError({
      message: 'Search is required',
      statusCode: 422,
    });
  }

  const { reply } = await completions({
    messages: [
      {
        content: `
You will be given the user's intention, and a document in markdown.

Your goal is to extract the relevant information from the document that can answer the user's question, and skip the rest.
You should not answer the question.
  `,
        role: 'system',
      },
      {
        content: `
The user's intent: ${body.intent}
The user's queries: ${body.queries.join(', ')}
The document:
${body.document}
`,
        role: 'user',
      },
    ],
    model: 'gpt-4o',
  });

  return reply;
});
