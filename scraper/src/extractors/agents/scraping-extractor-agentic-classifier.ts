// model
import { o1MiniClient } from '../../ai/scraper-ai-o1-mini.js';

// utils
import { attemptJSONParsing } from '../../utils/scraper-utils-json.js';
import { JSONPrompt } from '../../utils/scraper-utils-prompts.js';

/**
 * Analyze a webpage with an LLM and try to classify it.
 * @param root named parameters
 * @param root.summary the summary made in a previous request
 * @returns the classification of the webpage
 */
export async function agenticPageTypeDetection({
  summary,
}: {
  summary: string;
}): Promise<
  'blocked' | 'jobAdvert' | 'jobBoard' | 'notInteresting' | undefined
> {
  const modelResponse = await o1MiniClient.chat.completions.create({
    messages: [
      {
        content: `
You will be given a summary of a web page, and a potential category with explanation why this is the selected category.

You need to finalize the classification by choosing one of the following categories:

- blocked: The webpage has been blocked by bot prevention. Example: cloudflare protection
- jobAdvert: The webpage is about a job offer. Examples: a machine learning engineer role
- jobBoard: The webpage is will list other links to jobs or other job boards. It should specifically be for finding jobs Examples: a list of links for open positions, a list of links to companies career pages.
- notInteresting: The webpage is none of the previous options. Examples: a 404 page, a home page, a pricing page, documentation, any random page, etc.

${JSONPrompt({ keys: 'category' })}
`,
        role: 'system',
      },
      {
        content:
          'The page provides guidance for preparing job interviews. It has a blog post format and focus on interview questions. The appropriate category is "documentation page" because it provide informative content',
        role: 'user',
      },
      {
        content: '{"category":"notInteresting"}',
        role: 'assistant',
      },
      {
        content: summary,
        role: 'user',
      },
    ],
    model: 'o1-mini',
    // eslint-disable-next-line camelcase -- not our code
    response_format: {
      type: 'json_object',
    },
  });
  if (modelResponse.choices[0].message.content) {
    const json = await attemptJSONParsing<{
      category: ReturnType<Awaited<typeof agenticPageTypeDetection>>;
    }>({
      json: modelResponse.choices[0].message.content,
    });
    if (json?.category === undefined) {
      console.error('JSON Parsing error: category is undefined');
      console.error(modelResponse.choices[0].message.content);
      return undefined;
    }
    return json.category;
  } else {
    console.error('No content in the response');
    console.log(modelResponse);
  }
}

/**
 * Give a summary of a web page, and try to classify it.
 * The response will require further processing to be machine readable.
 * @param root named parameters
 * @param root.webpage the webpage to analyze in markdown
 * @returns the classification of the webpage
 */
export async function agenticSummary({
  webpage,
}: {
  webpage: string;
}): Promise<string | undefined> {
  const modelResponse = await o1MiniClient.chat.completions.create({
    messages: [
      {
        content: `
You will be given a web page, and you will try to classify it. To do so, you will go through three steps:

1. You need to summarize what is in this page in a few sentences.

2. List some key data about this web page, for example what is it presenting, in what format.

3. Use the summary and the key data to decide an appropriate category, and explain why you choose this category

The categories are generic categories about this web page, not about the company.
Some of the categories are:
- a home page, which aim to introduce the website or organization
- a pricing page, which aim to explain a pricing model
- a 404 page, which appear when information is no longer available
- a documentation page, which is usually a technical page explaining how to us a tool or service
- a job board, which will give a list of links of jobs, other job boards, company careers pages.
- a job advert, which will present a job, its requirements and why a user would or would not be interested.
- a blocked page, which is a page that is blocked by a bot prevention system.
If no category fit, create a new one.
  `,
        role: 'system',
      },
      {
        content: [
          {
            text: webpage,
            type: 'text',
          },
        ],
        role: 'user',
      },
    ],
    model: 'o1-mini',
  });

  if (modelResponse.choices[0].message.content) {
    return modelResponse.choices[0].message.content;
  } else {
    console.error('No content in the response');
    console.log(modelResponse);
  }
}
