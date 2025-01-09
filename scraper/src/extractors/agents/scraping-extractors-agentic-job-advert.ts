// types
import { o1MiniClient } from '../../ai/scraper-ai-o1-mini.js';

/**
 * Extract the content of a job advert using AI agents
 * @param root named parameters
 * @param root.webpage the HTML body extracted from the browser
 * @returns the urls extracted from the job board
 */
export async function agenticJobAdvertExtractor({
  webpage,
}: {
  webpage: string;
}): Promise<string | undefined> {
  const modelResponse = await o1MiniClient.chat.completions.create({
    messages: [
      {
        content: `
You are a person looking for a job. You will be given a web page in markdown.
You will remove any information that is not relevant for the job such as links, navigation, footers, recommendations, etc.
You must not modify the original text.
`,
        role: 'system',
      },
      {
        content:
          'Lead engineer.The role: you will be doing fun stuff in an ai company.Skills: good engineering background.Powered by [](https://demo.com) Read our [Privacy Policy](https://demo.com/privacy-policy) Recaptcha requires verification. [Privacy](https://demo.com/privacy/) - [Terms](https://demo.com/terms/) protected by *reCAPTCHA* [Privacy](https://demo.com/privacy/)',
        role: 'user',
      },
      {
        content:
          'The role: you will be doing fun stuff in an ai company.Skills: good engineering background.',
        role: 'assistant',
      },
      {
        content: webpage,
        role: 'user',
      },
    ],
    model: 'o1-mini',
  });
  return modelResponse.choices[0].message.content ?? undefined;
}
