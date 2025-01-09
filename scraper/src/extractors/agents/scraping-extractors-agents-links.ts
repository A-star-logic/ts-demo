// types
import { readFile } from 'node:fs/promises';

// models
import { o1MiniClient } from '../../ai/scraper-ai-o1-mini.js';

// utils
import { attemptJSONParsing } from '../../utils/scraper-utils-json.js';
import { JSONPrompt } from '../../utils/scraper-utils-prompts.js';

const ad3 = await readFile(
  import.meta.dirname + '/test/testfiles/adverts/ad3.md',
  'utf8',
);

/**
 * This function will try to extract urls that would be worth checking out.
 *
 * Those urls could be job adverts, job boards, other websites, etc.
 * @param root named parameters
 * @param root.webpage the HTML body extracted from the browser
 * @returns the urls extracted from the job board
 */
export async function linkExtractionAgent({
  webpage,
}: {
  webpage: string;
}): Promise<string[] | undefined> {
  const modelResponse = await o1MiniClient.chat.completions.create({
    messages: [
      {
        content: `
You are a a person looking for jobs. You will be given a web page in markdown.
There are links in this webpage, some that might be interesting and some that are not.

You need to make sure the urls are interesting.

- The urls should not be for navigating the current page (ex: home, about, terms).
- The urls should help you find more job adverts, for example another job advert, or a job board (ex: back to jobs, careers, or job titles).
- The user prefer to have too many urls instead of too little.

${JSONPrompt({ keys: 'urls' })}
`,
        role: 'system',
      },
      {
        content:
          '[back to jobs](https://mysite.com/jobs)about us: we are a very nice company growing fast. about the role: we are looking for an engineer. [apply here](https://mysite.com/apply).[Check out our github](https://github.com/mycompany/tool) Powered by [](https://demo.com) Read our [Privacy Policy](https://demo.com/privacy-policy) Recaptcha requires verification. [Privacy](https://demo.com/privacy/) - [Terms](https://demo.com/terms/) protected by *reCAPTCHA* [Privacy](https://demo.com/privacy/)',
        role: 'user',
      },
      {
        content: "{'urls':['https://mysite.com/jobs']}",
        role: 'assistant',
      },
      // {
      //   content:
      //     '[about](https://mysite.com/about)[faq](https://mysite.com/faq)Similar jobs[ai engineer](https://mysite.com/jobs/ai-engineer)[sales lead](https://mysite.com/jobs/sales-lead)[job guide](https://mysite.com/job-guide)',
      //   role: 'user',
      // },
      // {
      //   content:
      //     "{urls:['https://mysite.com/jobs/ai-engineer','https://mysite.com/jobs/sales-lead']}",
      //   role: 'assistant',
      // },
      {
        content: ad3,
        role: 'user',
      },
      {
        content:
          "{'urls':['https://www.ycombinator.com//jobs','https://www.ycombinator.com//jobs/role/software-engineer','https://www.ycombinator.com//jobs/role/operations','https://www.ycombinator.com//jobs/role/marketing','https://www.ycombinator.com//jobs/role/sales','https://www.ycombinator.com//companies/dynamo-ai/jobs/x38E3p8-ml-engineer-llm-evaluation','https://www.ycombinator.com//companies/afriex/jobs/qy719Z5-senior-javascript-engineer','https://www.ycombinator.com//companies/explorex/jobs/W4STL5S-backend-engineer-ii','https://www.ycombinator.com//companies/biodock/jobs/8DqWTLa-mid-senior-fullstack-engineer','https://www.ycombinator.com//companies/safetykit/jobs/vmViJw9-ai-product-engineer','https://www.ycombinator.com//companies/ply-health/jobs/TC9bCbL-founding-engineer','https://www.ycombinator.com//companies/central/jobs/bDbWoRv-staff-software-engineer-full-stack','https://www.ycombinator.com//companies/athina-ai/jobs/fP6Jnu3-developer-advocate','https://www.ycombinator.com//companies/permitflow/jobs/sh5wkwG-staff-software-engineer','https://www.ycombinator.com//companies/lineleap/jobs/kFTu8aB-senior-software-engineer-full-stack-mobile','https://www.ycombinator.com//companies/pocketsuite/jobs/WIUGZgMa8-senior-full-stack-mobile-engineer','https://www.ycombinator.com//companies/flexdesk/jobs/eFJ1O3D-full-stack-founding-engineer','https://www.ycombinator.com//companies/sameday/jobs/b0Ije7T-fullstack-engineer-ai-emphasis','https://www.ycombinator.com//companies/brighterway/jobs/r9ZyE6o-founding-full-stack-engineer','https://www.ycombinator.com//companies/poly/jobs/nHMeghI-platform-engineer-infra-reliability-specialist','https://www.ycombinator.com//companies/oneleet/jobs/LZaEMA6-software-engineer-integrations','https://www.ycombinator.com//companies/eight-sleep/jobs/slZD7gD-full-stack-engineer-web-focus','https://www.ycombinator.com//companies/levro/jobs/lLZ0UuV-fullstack-engineer','https://www.ycombinator.com//companies/buildbuddy/jobs/07eWOFR-senior-software-engineer','https://www.ycombinator.com//companies/porter/jobs/6QhplSz-full-stack-engineer','https://www.ycombinator.com//companies/dynamo-ai','https://www.ycombinator.com//companies/afriex','https://www.ycombinator.com//companies/explorex','https://www.ycombinator.com//companies/biodock','https://www.ycombinator.com//companies/safetykit','https://www.ycombinator.com//companies/ply-health','https://www.ycombinator.com//companies/central','https://www.ycombinator.com//companies/athina-ai','https://www.ycombinator.com//companies/permitflow','https://www.ycombinator.com//companies/lineleap','https://www.ycombinator.com//companies/pocketsuite','https://www.ycombinator.com//companies/flexdesk','https://www.ycombinator.com//companies/sameday','https://www.ycombinator.com//companies/brighterway','https://www.ycombinator.com//companies/poly','https://www.ycombinator.com//companies/oneleet','https://www.ycombinator.com//companies/eight-sleep','https://www.ycombinator.com//companies/levro','https://www.ycombinator.com//companies/buildbuddy','https://www.ycombinator.com//companies/porter']}",
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
    const json = await attemptJSONParsing<{ urls: string[] }>({
      json: modelResponse.choices[0].message.content,
    });
    if (!json) return undefined;
    return json.urls;
  } else {
    console.error('No content in the response');
    console.log(modelResponse);
  }
}

/*
Why is the code commented out?
The tests were not conclusive, usually the agents were doing a worse job than giving back json straight away.

Usually what happens is the agent misses the links (some actually important links are skipped)
This is always during the filtering step, important links are left out, while links that are important do not show in the answer.

Theory: the json prompt is given a very thorough few shot prompt, with an entire example.
Maybe giving a larger (more close to reality) example would help
*/
// todo look into this later

// /**
//  * Ask an agent to filter out links that may not be interesting.
//  * @param root named parameters
//  * @param root.linksSummary the summary of the links from the previous agent
//  * @returns the filtered links
//  */
// export async function linkFilterAgent({
//   linksSummary,
// }: {
//   linksSummary: string;
// }): Promise<string | undefined> {
//   const modelResponse = await o1MiniClient.chat.completions.create({
//     messages: [
//       {
//         content: `
// You are looking for jobs adverts, you will be given a list of links and what they link to, some links might be interesting and some are not.
// You goal is to filter out the links that are not interesting.

// - The links should not be for navigating the current page (ex: home, about, terms).
// - The links should help you find more job adverts, for example another job advert, or a job board (ex: back to jobs, careers, or job titles).
// - The user prefer to have too many urls instead of too little.

// Answer with the links in brackets, and a short explanation of why you think it is interesting.
// `,
//         role: 'system',
//       },
//       {
//         content: `
// [https://mysite.com/pricing]: This is a link to the pricing page.
// [https://mysite.com/terms]: This is a link to the terms and conditions page.
// [https://mysite.com/careers]: This is a link to the careers page.
// [https://mysite.com/careers/ml-engineer]: This link is for a job position.
// [https://mysite.com/blog]: This is a link to a blog.
// [https://mysite.com/finding-new-jobs]: This is a link to a coaching blog.
//         `,
//         role: 'user',
//       },
//       {
//         content: `
// [https://mysite.com/carreers]: This link is interesting because it is a link to the careers page.
// [https://mysite.com/careers/ml-engineer]: This link is interesting because it is a link to a job position.
// `,
//         role: 'assistant',
//       },
//       {
//         content: linksSummary,
//         role: 'user',
//       },
//     ],
//     model: 'o1-mini',
//   });

//   if (modelResponse.choices[0].message.content) {
//     return modelResponse.choices[0].message.content;
//   } else {
//     console.error('No content in the response');
//     console.log(modelResponse);
//   }
// }

// /**
//  * This agent will select a set of interesting links from a webpage and explain why they were selected.
//  * @param root named parameters
//  * @param root.webpage the webpage
//  * @returns the summary of the links
//  */
// export async function linkSummaryAgent({
//   webpage,
// }: {
//   webpage: string;
// }): Promise<string | undefined> {
//   const modelResponse = await o1MiniClient.chat.completions.create({
//     messages: [
//       {
//         //         content: `
//         // You are a smart web scraper. You will be given a web page in markdown.

//         // Your task is to find and list every link that you think is interesting.
//         // Put every link in brackets, and explain why you think it is interesting.
//         // You do not need to list the same link twice, or make a summary of your findings.

//         // You need to make sure the urls are interesting.

//         // - The urls should not be for navigating the current page (ex: home, about, terms).
//         // - The urls should help you find more job adverts, for example another job advert, or a job board (ex: back to jobs, careers, or job titles), or a website with more adverts.
//         // - The user prefer to have too many urls instead of too little.

//         // Example of good links:
//         // [https://mysite.com/carreers]: This is a link to the careers page.
//         // [https://mysite.com/careers/ml-engineer]: This is a link to a job position.

//         // Example of bad links:
//         // - Home page
//         // - Pricing page
//         // - Terms and conditions page
//         // - A blog
//         // - Coaching, guidance or advice pages
//         // `,
//         content: `
// You are a smart web scraper. You will be given a web page in markdown.
// You will find and list every link on the page, put them in brackets, and explain what you think they are linking to.
// You do not need to list the same link twice, or make a summary of your findings.

// Example:
// [https://mysite.com/pricing]: This is a link to the pricing page.
// [https://mysite.com/terms]: This is a link to the terms and conditions page.
// [https://mysite.com/carreers]: This is a link to the careers page.
// `,
//         role: 'system',
//       },
//       {
//         content: webpage,
//         role: 'user',
//       },
//     ],
//     model: 'o1-mini',
//   });

//   if (modelResponse.choices[0].message.content) {
//     return modelResponse.choices[0].message.content;
//   } else {
//     console.error('No content in the response');
//     console.log(modelResponse);
//   }
// }
