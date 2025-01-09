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
  if (!response.ok) throw Error('OOps could not scrape!');

  // const ids = [];
  // const rewriter = new HTMLRewriter().on('.athing[id]', {
  //   element(el) {
  //     ids.push(el.getAttribute('id')!);
  //   },
  // });

  // await consume(rewriter.transform(response).body!);

  // // `ids` is now populated:
  // console.log(ids);
  const page = '';

  class DocumentHandler {
    element(element) {
      // An incoming element, such as `div`
      // console.log(element.tagName);
      if (element.tagName === 'a') console.log(element.attributes);
    }

    comments(comment) {
      // An incoming comment
      // console.log(`Incoming comment: ${comment}`);
    }

    text(text) {
      // An incoming piece of text
      // if (text.text !== '\n') console.log(text.text);
    }

    end(end) {
      // The end of the document
      console.log('End of the document');
      console.log(`End of document: ${end}`);
    }

    endTag(endTag) {
      // The end of an element
      console.log(`End of element: ${endTag}`);
    }
  }

  // const rewriter = new HTMLRewriter().on('.athing[id]', {
  //   element(el) {
  //     ids.push(el.getAttribute('id')!);
  //   },
  // });
  const truc = new HTMLRewriter().on('*', new DocumentHandler());

  // await consume(rewriter.transform(response).body!);
  await consume(truc.transform(response).body!);

  // const target = new EventTarget(); // 1

  // const rewriter = new HTMLRewriter().on('.athing[id]', {
  //   element(el) {
  //     target.dispatchEvent(
  //       new CustomEvent('data', {
  //         // 2
  //         detail: el.getAttribute('id'),
  //       }),
  //     );
  //   },
  // });

  // const data = evenTargetToAsyncIter(target, 'data'); // 3

  // consume(rewriter.transform(response).body!) // 4
  //   .catch((e) => data.throw(e)) // 5
  //   .then(() => data.return()); // 6

  // for await (const id of data) {
  //   // 7
  //   console.log(id);
  // }

  return c.json('hi');
});

export default app;
