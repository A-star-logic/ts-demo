/*

This code is copy pasted from https://github.com/A-star-logic/memoire/blob/main/src/api/search/api-search-schemas.ts
while waiting for the SDK to be released

*/
// libs
import { type Static, Type } from '@sinclair/typebox';

const basicResponseSchema = Type.Object({
  message: Type.String({
    examples: ['ok'],
  }),
});
type BasicResponse = Static<typeof basicResponseSchema>;

const documentLinkBodySchema = Type.Object(
  {
    documents: Type.Array(
      Type.Object(
        {
          documentID: Type.String({
            description:
              'The ID of the document. **Note** This id can only support letters, numbers, dashes (-) and underscores (_)',
          }),
          metadata: Type.Optional(
            Type.Object(
              {},
              {
                description:
                  'Any metadata related to the document. This is not used for the search or filtering',
              },
            ),
          ),
          title: Type.Optional(
            Type.String({
              description: 'The title of the document, if any',
            }),
          ),
          url: Type.String({}),
        },
        {
          description: 'An array of document to ingest.',
        },
      ),
    ),
  },
  {
    additionalProperties: false,
    examples: [
      {
        documents: [
          {
            documentID: 'abc-123',
            metadata: { meta: 'data' },
            title: 'A test txt file',
            url: 'https://raw.githubusercontent.com/A-star-logic/memoire/refs/heads/main/src/parser/tests/sampleFiles/test.txt',
          },
          {
            documentID: 'def-456',
            url: 'https://github.com/A-star-logic/memoire/raw/refs/heads/main/src/parser/tests/sampleFiles/test.docx',
          },
          {
            documentID: 'def-789',
            url: 'https://github.com/A-star-logic/memoire/raw/refs/heads/main/src/parser/tests/sampleFiles/test.csv',
          },
        ],
      },
    ],
  },
);
type DocumentLinkBody = Static<typeof documentLinkBodySchema>;

const ingestRawBodySchema = Type.Object(
  {
    documents: Type.Array(
      Type.Object(
        {
          content: Type.String({
            description:
              'The content of the document in plain text. Ideally formatted as markdown',
          }),
          documentID: Type.String({
            description:
              'The ID of the document. **Note** This id can only support letters, numbers, dashes (-) and underscores (_)',
          }),
          metadata: Type.Optional(
            Type.Object(
              {},
              {
                description:
                  'Any metadata related to the document. This is not used for the search or filtering',
              },
            ),
          ),
          title: Type.Optional(
            Type.String({
              description: 'The title of the document, if any',
            }),
          ),
        },
        {
          description: 'An array of document to ingest in plain text.',
        },
      ),
    ),
  },
  {
    additionalProperties: false,
    examples: [
      {
        documents: [
          {
            content: '# A test document\nhello world',
            documentID: 'abc-123',
            metadata: { meta: 'data' },
            title: 'File 1',
          },
          {
            content: 'Another test document',
            documentID: 'def-456',
          },
          {
            content: 'and another one with more metadata',
            documentID: 'def-789',
            metadata: { meta: 'data' },
          },
        ],
      },
    ],
  },
);
type IngestRawBody = Static<typeof ingestRawBodySchema>;

const searchBodySchema = Type.Object(
  {
    maxResults: Type.Optional(
      Type.Number({
        default: 100,
        description: 'The maximum number of results to return',
        examples: [10],
        minimum: 1,
      }),
    ),
    query: Type.String({
      description: 'The search query',
      examples: ['hello'],
    }),
  },
  { additionalProperties: false },
);
type SearchBody = Static<typeof searchBodySchema>;
const searchResponseSchema = Type.Object(
  {
    results: Type.Array(
      Type.Object({
        content: Type.String({
          description: 'The original document content',
        }),
        documentID: Type.String({}),
        highlights: Type.Optional(
          Type.String({
            description:
              '(Optional) the highlight of the document/Closest match. This is to be used in RAG or to display the relevant part of the document to the user',
          }),
        ),
        metadata: Type.Optional(Type.Object({})),
        score: Type.Number({
          description:
            'The search score of the document. This score can be higher than 1',
        }),
        title: Type.Optional(Type.String()),
      }),
    ),
  },
  { additionalProperties: false },
);
type SearchResponse = Static<typeof searchResponseSchema>;

const searchDeleteBodySchema = Type.Object(
  {
    documentIDs: Type.Array(Type.String(), {
      examples: [['document1', 'abc-123']],
    }),
  },
  { additionalProperties: false },
);
type SearchDeleteBody = Static<typeof searchDeleteBodySchema>;

function MemoireClient({
  apiKey,
  memoireUrl,
}: {
  apiKey: string;
  memoireUrl: string;
}) {
  /**
   * Helper function to make fetch requests
   * @param endpoint API endpoint to call (relative to `memoireUrl`)
   * @param options Fetch options (method, headers, body, etc.)
   */
  async function fetchRequest(
    endpoint: string,
    options: RequestInit,
  ): Promise<Response> {
    const url = `${memoireUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  }

  /**
   * Ingest a list of documents in Memoire
   * @param root named parameters
   * @param root.documents the list of documents to ingest
   */
  async function ingestRawDocuments({
    documents,
  }: {
    documents: IngestRawBody['documents'];
  }): Promise<void> {
    const start = Date.now();

    const response = await fetchRequest('/search/ingest/raw', {
      method: 'POST',
      body: JSON.stringify({ documents }),
    });

    // Handle non-2xx HTTP responses
    if (!response.ok) {
      console.error(response);
      console.error(await response.json());
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${errorText}`,
      );
    }

    const end = Date.now();
    console.log(`ingestRawDocuments took ${end - start}ms`);
  }

  /**
   * Delete documents from Memoire
   * @param root named parameters
   * @param root.documentIDs Ids of the documents to delete
   */
  async function deleteDocuments({
    documentIDs,
  }: {
    documentIDs: SearchDeleteBody['documentIDs'];
  }): Promise<void> {
    const start = Date.now();

    const response = await fetchRequest('/search/documents', {
      method: 'DELETE',
      body: JSON.stringify({ documentIDs }),
    });

    // Handle non-2xx HTTP responses
    if (!response.ok) {
      console.error(response.json());
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${errorText}`,
      );
    }

    const end = Date.now();
    console.log(`deleteDocuments took ${end - start}ms`);
  }

  async function search({
    query,
    maxResults,
  }: SearchBody): Promise<SearchResponse['results']> {
    const start = Date.now();

    const response = await fetchRequest('/search', {
      method: 'POST',
      body: JSON.stringify({ query, maxResults }),
    });

    // Handle non-2xx HTTP responses
    if (!response.ok) {
      console.error(response.json());
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${errorText}`,
      );
    }

    const end = Date.now();
    console.log(`search took ${end - start}ms`);

    return ((await response.json()) as SearchResponse).results;
  }

  return {
    ingestRaw: ingestRawDocuments,
    delete: deleteDocuments,
    search,
  };
}

if (!process.env.MEMOIRE_API_KEY) {
  throw new Error('Please set the MEMOIRE_API_KEY env variable');
}
if (!process.env.MEMOIRE_URL) {
  throw new Error('Please set the MEMOIRE_URL env variable');
}

export const memoire = MemoireClient({
  apiKey: process.env.MEMOIRE_API_KEY,
  memoireUrl: process.env.MEMOIRE_URL,
});
