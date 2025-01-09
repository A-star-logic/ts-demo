// libs
import type {
  HttpHandler,
  HttpRequest,
  HttpResponse,
  InvocationContext,
} from '@azure/functions';
import type {
  ActivityHandler,
  OrchestrationContext,
  OrchestrationHandler,
} from 'durable-functions';
import { app } from '@azure/functions';
import * as df from 'durable-functions';

// browser
import { closeBrowser, initBrowser } from '../browser/scraper-browser.js';

// core
import { scrape } from '../core.js';
import { deleteCrawler } from '../storage/d1/scraper-storage-d1.js';

const scrapeOrchestrator: OrchestrationHandler = function* (
  context: OrchestrationContext,
) {
  const outputs: unknown[] = [];
  outputs.push(
    yield context.df.callActivity('scrapeTask', context.df.getInput()),
  );
  return outputs;
};

df.app.orchestration('scrapeOrchestrator', scrapeOrchestrator);

const scrapeTask: ActivityHandler = async (input: string): Promise<void> => {
  await initBrowser();
  try {
    await scrape({ url: input, urlType: 'jobAdvert' });
  } catch (error) {
    console.error(error);
  }
  await deleteCrawler({ crawlerID: input.crawlerID });
  await closeBrowser();
};
df.app.activity('scrapeTask', { handler: scrapeTask });

const helloHttpStart: HttpHandler = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponse> => {
  const client = df.getClient(context);
  const body = await request.text();

  // todo: validate body
  // todo: validate api token

  const instanceId: string = await client.startNew('scrapeOrchestrator', {
    input: body,
  });

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return client.createCheckStatusResponse(request, instanceId);
};

app.http('httpDurableFunction', {
  extraInputs: [df.input.durableClient()],
  handler: helloHttpStart,
  route: 'scrape',
});
