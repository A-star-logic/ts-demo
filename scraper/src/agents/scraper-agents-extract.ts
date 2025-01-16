import { completions } from '@demo-pkg/llm/call';
import { JSONPrompt } from '@demo-pkg/llm/llm-prompts.js';
import { attemptJSONParsing } from '../utils/scraper-utils-json.js';

/**
 * Detect the page status, and categorize it
 * @param root named parameters
 * @param root.markdown the page in markdown
 * @returns 'blocked', 'not found' or 'valid'; 'failed' in the case of an error (instead of undefined)
 */
export async function detectPageStatus({
  markdown,
}: {
  markdown: string;
}): Promise<'blocked' | 'failed' | 'not found' | 'valid'> {
  console.log('detecting page status');
  const { reply } = await completions({
    json: true,
    messages: [
      {
        content: `
You will be given a web page in markdown.
You need to finalize the classification by choosing one of the following categories:

- blocked: The webpage has been blocked by bot prevention. Example: cloudflare protection
- not found: The webpage does not exist. Example: a 404 page
- valid: The webpage is valid. Examples: a home page, a pricing page, documentation, etc.

${JSONPrompt({ keys: 'category' })}
        `,
        role: 'system',
      },
      {
        content: markdown,
        role: 'user',
      },
    ],
    model: 'gpt-4o-mini',
  });

  if (reply) {
    const json = await attemptJSONParsing<{
      category: 'blocked' | 'not found' | 'valid';
    }>({ json: reply });
    console.log(`status is ${json?.category}`);
    if (!json) {
      return 'failed';
    }
    return json.category;
  }

  console.log('No reply from Model');
  return 'failed';
}

/**
 * Request an agent to extract the relevant data from a page.
 *
 * The goal of this agent is to find data that is the same on multiple pages (such as navbars, footers, etc.),
 * and to remove it from the markdown.
 * @param root named parameters
 * @param root.markdown the web page as a markdown string
 * @returns a cleaned markdown, or undefined if the agent failed
 */
export async function extractRelevantData({
  markdown,
}: {
  markdown: string;
}): Promise<string | undefined> {
  console.log('extracting relevant data');
  const { reply } = await completions({
    messages: [
      {
        content: `
You will be given a web page in markdown.
You need to remove any data that would be identical across the website.
You need to keep the rest of the page intact with zero changes.

Example of data to remove:
- navigation bar
- footers
- navigation links
- buttons
- forms
- call to actions
        `,
        role: 'system',
      },
      {
        content: markdown,
        role: 'user',
      },
    ],
    model: 'gpt-4o-mini',
  });
  console.log('done extracting relevant data');
  return reply;
}
