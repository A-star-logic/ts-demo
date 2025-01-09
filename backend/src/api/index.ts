import { Hono } from 'hono';

const app = new Hono<{ Bindings: CloudflareBindings }>();

async function consume(stream: ReadableStream) {
  const reader = stream.getReader();
  while (!(await reader.read()).done) {
    /* NOOP */
  }
}

app.get('/api/', async (c) => {
  const parser = new HTMLRewriter();

  const response = await fetch(
    'https://news.ycombinator.com/',
    // {
    //   headers: {
    //     'X-Source': 'Cloudflare-Workers',
    //   },
    // },
  );
  if (!response.ok) throw Error('Oops could not scrape!');

  const html = await response.text();

  return c.json(html);
});

export default app;
