// libs
import { $fetch } from 'ofetch';
import { defineStore } from 'pinia';

// types
import type {
  BuildSearchesBody,
  BuildSearchesResponse,
} from '../server/api/build-searches.post.ts';
import type { ExtractBody } from '../server/api/extract.post.ts';
import type {
  FilterDocumentsBody,
  FilterDocumentsResponse,
} from '../server/api/filter.post.ts';
import type {
  GenerateAnswerBody,
  GenerateAnswerResponse,
} from '../server/api/generate-answer.post.ts';
import type {
  PostSearchBody,
  PostSearchResponse,
} from '../server/api/search.post.ts';

interface PipelineState {
  /* eslint-disable perfectionist/sort-interfaces -- better have them ordered by call order */
  buildSearchesLoading: boolean | undefined;
  buildSearchesError: boolean;
  proposedSearches: string[] | undefined;
  searchResultsLoading: boolean | undefined;
  searchResultsError: boolean;
  searchResultsLength: number | undefined;
  filteredLoading: boolean | undefined;
  filteredError: boolean;
  filteredNumber: number | undefined;
  relevantDocuments: PostSearchResponse | undefined;
  extractLoading: boolean | undefined;
  extractError: boolean;
  extractNumber: number | undefined;
  responseLoading: boolean | undefined;
  responseError: boolean;
  response: GenerateAnswerResponse['reply'] | undefined;
  /* eslint-enable perfectionist/sort-interfaces -- better have them ordered by call order */
}

/**
 * Build a set of queries to execute multiple searches
 * @param root named parameters
 * @param root.query the query
 * @param root.store Pinia store
 * @returns the intent and the proposed queries
 */
async function buildQueries({
  query,
  store,
}: {
  query: string;
  store: PipelineState;
}): Promise<undefined | { intent: string; proposedSearches: string[] }> {
  store.buildSearchesLoading = true;
  store.buildSearchesError = false;
  try {
    const buildResponse = await $fetch<BuildSearchesResponse>(
      '/api/build-searches',
      {
        body: { search: query } satisfies BuildSearchesBody,
        method: 'POST',
      },
    );
    store.buildSearchesLoading = false;
    if (!buildResponse.proposedSearches || !buildResponse.intent) {
      console.error('No search intent generated');
      store.buildSearchesError = true;
      return;
    }
    return {
      intent: buildResponse.intent,
      proposedSearches: buildResponse.proposedSearches,
    };
  } catch (error) {
    console.error(error);
    store.buildSearchesError = true;
    store.buildSearchesLoading = false;
  }
}

/**
 * Extract the relevant information from the results that have been kept
 * @param root named parameters
 * @param root.intent the intent
 * @param root.queries the queries
 * @param root.relevantDocuments the relevant documents
 * @param root.store Pinia store
 * @returns the extracted documents
 */
async function extract({
  intent,
  queries,
  relevantDocuments,
  store,
}: {
  intent: string;
  queries: string[];
  relevantDocuments: PostSearchResponse;
  store: PipelineState;
}): Promise<string[] | undefined> {
  store.extractLoading = true;
  store.extractError = false;
  store.extractNumber = 0;
  try {
    const extractedDocuments = await Promise.all(
      relevantDocuments.map(async (result) => {
        const extracted = await $fetch<string>('/api/extract', {
          body: {
            document: result.content,
            intent,
            queries,
          } satisfies ExtractBody,
          method: 'POST',
        });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- defined above
        store.extractNumber = store.extractNumber! + 1;
        return extracted;
      }),
    );
    store.extractLoading = false;
    return extractedDocuments;
  } catch (error) {
    console.error(error);
    store.extractError = true;
    store.extractLoading = false;
  }
}

/**
 * Filter the search results using agents
 * @param root named parameters
 * @param root.intent the search intent
 * @param root.queries the queries
 * @param root.searchResults the search results from a previous step
 * @param root.store Pinia store
 * @returns the filtered results
 */
async function filter({
  intent,
  queries,
  searchResults,
  store,
}: {
  intent: string;
  queries: string[];
  searchResults: PostSearchResponse;
  store: PipelineState;
}): Promise<PostSearchResponse | undefined> {
  store.filteredLoading = true;
  store.filteredError = false;
  store.filteredNumber = 0;

  try {
    const filtered = await Promise.all(
      searchResults.map(async (result) => {
        const { decision } = await $fetch<FilterDocumentsResponse>(
          '/api/filter',
          {
            body: {
              intent,
              queries,
              searchResult: result,
            } satisfies FilterDocumentsBody,
            method: 'POST',
          },
        );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we defined it right above
        store.filteredNumber = store.filteredNumber! + 1;
        if (decision === 'relevant') {
          return result;
        }
        return undefined;
      }),
    );

    const relevantDocuments = filtered.filter((document) => {
      return document !== undefined;
    });

    store.filteredLoading = false;
    if (relevantDocuments.length === 0) {
      console.error('No documents kept');
      store.filteredError = true;
      return;
    }
    return relevantDocuments;
  } catch (error) {
    console.error(error);
    store.filteredError = true;
    store.filteredLoading = false;
  }
}

/**
 * Generate the response
 * @param root named parameters
 * @param root.documents the documents to add to the prompt
 * @param root.intent the intent
 * @param root.query the query
 * @param root.store Pinia store
 * @returns the response
 */
async function generateResponse({
  documents,
  intent,
  query,
  store,
}: {
  documents: string[];
  intent: string;
  query: string;
  store: PipelineState;
}): Promise<string | undefined> {
  store.responseLoading = true;
  store.responseError = false;

  try {
    const { reply } = await $fetch<GenerateAnswerResponse>(
      '/api/generate-answer',
      {
        body: {
          documents,
          intent,
          query,
        } satisfies GenerateAnswerBody,
        method: 'POST',
      },
    );
    store.responseLoading = false;
    if (!reply) {
      console.error('No response from generate answer');
      store.responseError = true;
      return;
    }
    return reply;
  } catch (error) {
    console.error(error);
    store.responseError = true;
    store.responseLoading = false;
  }
}

/**
 * Search for relevant documents
 * @param root named parameters
 * @param root.queries a list of queries for searching
 * @param root.store Pinia store
 * @returns the search results
 */
async function search({
  queries,
  store,
}: {
  queries: string[];
  store: PipelineState;
}): Promise<PostSearchResponse | undefined> {
  store.searchResultsLoading = true;
  store.searchResultsError = false;

  try {
    const searchResults = await $fetch<PostSearchResponse>('/api/search', {
      body: {
        queries,
      } satisfies PostSearchBody,
      method: 'POST',
    });
    store.searchResultsLoading = false;
    return searchResults;
  } catch (error) {
    console.log(error);
    store.searchResultsError = true;
    store.searchResultsLoading = false;
  }
}

export const usePipelineStore = defineStore('pipeline', {
  actions: {
    /**
     * Run the search pipeline using the user's query
     * @param root named parameters
     * @param root.query the user's query
     */
    async runPipeline({ query }: { query: string }) {
      if (!query || query.trim().length === 0) return;

      const buildQueriesResponse = await buildQueries({ query, store: this });
      if (!buildQueriesResponse) {
        return;
      }
      this.proposedSearches = buildQueriesResponse.proposedSearches;
      const queries = [...buildQueriesResponse.proposedSearches, query];
      const { intent } = buildQueriesResponse;

      const searchResults = await search({ queries, store: this });
      if (!searchResults) {
        return;
      }
      this.searchResultsLength = searchResults.length;

      const relevantDocuments = await filter({
        intent,
        queries,
        searchResults,
        store: this,
      });
      if (!relevantDocuments) {
        return;
      }
      this.relevantDocuments = relevantDocuments;

      const extractedDocuments = await extract({
        intent,
        queries,
        relevantDocuments,
        store: this,
      });
      if (!extractedDocuments) {
        return;
      }

      const response = await generateResponse({
        documents: extractedDocuments,
        intent,
        query,
        store: this,
      });
      this.response = response;
    },
  },

  getters: {
    sources: (state) => {
      if (state.relevantDocuments) {
        const links: string[] = [];
        for (const document of state.relevantDocuments) {
          // @ts-expect-error it's here, trust me bro
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- it's here, trust me bro
          links.push(document.metadata.originalUrl);
        }

        return links;
      }
      return undefined;
    },
  },

  state: (): PipelineState => {
    return {
      buildSearchesError: false,
      buildSearchesLoading: undefined,
      extractError: false,
      extractLoading: undefined,
      extractNumber: undefined,
      filteredError: false,
      filteredLoading: undefined,
      filteredNumber: undefined,
      proposedSearches: undefined,
      relevantDocuments: undefined,
      response: undefined,
      responseError: false,
      responseLoading: undefined,
      searchResultsError: false,
      searchResultsLength: undefined,
      searchResultsLoading: undefined,
    };
  },
});
