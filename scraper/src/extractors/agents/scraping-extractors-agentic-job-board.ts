// types
import type { JobBoardExtractorOutput } from '../scraping-extractors-model.js';

// ai clients
import { o1MiniClient } from '../../ai/scraper-ai-o1-mini.js';

// utils
import { epochFromString } from '../../utils/scraper-utils-dates.js';
import { attemptJSONParsing } from '../../utils/scraper-utils-json.js';

/**
 * Extract the content of the job board using AI agents
 * @param root named parameters
 * @param root.webpage the HTML body extracted from the browser
 * @returns the urls extracted from the job board
 */
export async function agenticJobBoardExtractor({
  webpage,
}: {
  webpage: string;
}): Promise<JobBoardExtractorOutput | undefined> {
  const modelResponse = await o1MiniClient.chat.completions.create({
    messages: [
      {
        content: `
You are a web scraper. You will be given a web page in markdown.
You need to send back a json object with the following keys:
  - nextPage: the url of the next page to scrape; this can be null if there are no more pages to scrape. This should have the same domain as the original url.
  - urlsExtracted: a list of urls to check out, each url is an object with the following keys:
    - url: the url
    - postedOn: the date the job posting was posted on, it can be a date dd/mm/yyyy or a number of days since the current date (e.g. 1d, 2m). Can be null if there is no date.
The urls to check out should be for a job advert, or a job board, or a website who might have a job board. They should not be for random websites or navigating the current page.
Your response will be used by a software, there is no need for newlines or spaces.
          `,
        role: 'system',
      },
      {
        content:
          '[FAQ](https://demo.com/faq)[People](https://demo.com/people)[Rust engineer](https://mywebsite.net/jobs/rust-engineer)[more](https://demo.com/page-1)',
        role: 'user',
      },
      {
        content:
          "{nextPage:'https://demo.com/page-1',urlsExtracted:[{url:'https://mywebsite.net/jobs/rust-engineer',postedOn:null}]}",
        role: 'assistant',
      },
      {
        content:
          '[pricing](https://mywebsite.net/pricing)[features](https://mywebsite.net/features)[marketing manager](https://mywebsite.net/careers/marketing-manager)(20 days ago)[sales lead](https://mywebsite.net/careers/sales-lead)(2 hours ago)[next page](https://mywebsite.net/jobs?next=2)',
        role: 'user',
      },
      {
        content:
          "{nextPage:'https://mywebsite.net/jobs?next=2',urlsExtracted:[{url:'https://mywebsite.net/careers/marketing-manager',postedOn:20d},{url:'https://mywebsite.net/careers/sales-lead',postedOn:2h}]}",
        role: 'assistant',
      },
      {
        content: webpage,
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
    const json = await attemptJSONParsing<JobBoardExtractorOutput>({
      json: modelResponse.choices[0].message.content,
    });

    if (!json) return undefined;
    for (const urlExtracted of json.urlsExtracted) {
      if (urlExtracted.postedOn) {
        const date = await epochFromString({
          string: urlExtracted.postedOn as unknown as string, // postedOn is unknown at this stage
        });
        urlExtracted.postedOn = date;
      }
    }

    return json;
  }
}
