// libs
import { $fetch } from 'ofetch';
import { defineStore } from 'pinia';

// types
import type {
  BuildSearchesBody,
  BuildSearchesResponse,
} from '../server/api/build-searches.post.ts';
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
import type {
  SummarizeBody,
  SummarizeResponse,
} from '../server/api/summarize.post.ts';

interface PipelineState {
  /* eslint-disable perfectionist/sort-interfaces -- better have them ordered by call order */
  buildSearchesLoading: boolean | undefined;
  buildSearchesError: boolean;
  buildSearchesResponse: BuildSearchesResponse | undefined;
  searchResultsLoading: boolean | undefined;
  searchResultsError: boolean;
  searchResults: PostSearchResponse | undefined;
  filteredLoading: boolean | undefined;
  filteredError: boolean;
  filteredResults: FilterDocumentsResponse['filtered'] | undefined;
  filteredNumber: number | undefined;
  relevantDocuments: PostSearchResponse | undefined;
  summariesLoading: boolean | undefined;
  summariesError: boolean;
  summaries: SummarizeResponse['summaries'] | undefined;
  filteredSummaries: string[] | undefined;
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
 */
async function buildQueries({
  query,
  store,
}: {
  query: string;
  store: PipelineState;
}): Promise<void> {
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
    if (!buildResponse.proposedSearches || !buildResponse.intent) {
      console.error('No search intent generated');
      store.buildSearchesError = true;
      return;
    }
    store.buildSearchesResponse = buildResponse;
  } catch (error) {
    console.error(error);
    store.buildSearchesError = true;
  } finally {
    store.buildSearchesLoading = false;
  }
}

/**
 * Filter the search results using agents
 * @param root named parameters
 * @param root.query the query
 * @param root.store Pinia store
 */
async function filter({
  query,
  store,
}: {
  query: string;
  store: PipelineState;
}): Promise<void> {
  store.filteredLoading = true;
  store.filteredError = false;
  const intent = store.buildSearchesResponse?.intent ?? query;
  const searchResults = store.searchResults;
  if (!searchResults) {
    console.error('No search results to filter');
    return;
  }
  try {
    const { filtered } = await $fetch<FilterDocumentsResponse>('/api/filter', {
      body: {
        intent,
        searchResults,
      } satisfies FilterDocumentsBody,
      method: 'POST',
    });
    store.filteredResults = filtered;
    const relevantDocuments = searchResults.filter((result) => {
      return filtered.find((f) => {
        return f.id === result.documentID && f.classification === 'relevant';
      });
    });
    if (relevantDocuments.length === 0) {
      console.error('No documents kept');
      store.filteredError = true;
      return;
    }
    store.relevantDocuments = relevantDocuments;
  } catch (error) {
    console.error(error);
    store.filteredError = true;
  } finally {
    store.filteredLoading = false;
  }
}

/**
 * Generate the response
 * @param root named parameters
 * @param root.query the query
 * @param root.store Pinia store
 */
async function generateResponse({
  query,
  store,
}: {
  query: string;
  store: PipelineState;
}): Promise<void> {
  store.responseLoading = true;
  store.responseError = false;
  if (!store.buildSearchesResponse?.intent) {
    console.error('No search intent');
    return;
  }
  if (!store.filteredSummaries) {
    console.error('No filtered summaries');
    return;
  }

  try {
    const { reply } = await $fetch<GenerateAnswerResponse>(
      '/api/generate-answer',
      {
        body: {
          intent: store.buildSearchesResponse.intent,
          query,
          summaries: store.filteredSummaries,
        } satisfies GenerateAnswerBody,
        method: 'POST',
      },
    );
    if (!reply) {
      console.error('No response from generate answer');
      store.responseError = true;
      return;
    }
    store.response = reply;
  } catch (error) {
    console.error(error);
    store.responseError = true;
  } finally {
    store.responseLoading = false;
  }
}

/**
 * Search for relevant documents
 * @param root named parameters
 * @param root.query the query
 * @param root.store Pinia store
 */
async function search({
  query,
  store,
}: {
  query: string;
  store: PipelineState;
}): Promise<void> {
  store.searchResultsLoading = true;
  store.searchResultsError = false;
  const proposedSearches = store.buildSearchesResponse?.proposedSearches ?? [];
  try {
    const searchResults = await $fetch<PostSearchResponse>('/api/search', {
      body: {
        queries: [...proposedSearches, query],
      } satisfies PostSearchBody,
      method: 'POST',
    });
    store.searchResults = searchResults;
  } catch (error) {
    console.log(error);
    store.searchResultsError = true;
  } finally {
    store.searchResultsLoading = false;
  }
}

/**
 * Summarize the results that have been kept
 * @param root named parameters
 * @param root.store Pinia store
 */
async function summarize({ store }: { store: PipelineState }): Promise<void> {
  store.summariesLoading = true;
  store.summariesError = false;

  if (!store.buildSearchesResponse?.intent) {
    console.error('No search intent');
    return;
  }
  if (!store.relevantDocuments) {
    console.error('No search results to summarizes');
    return;
  }
  try {
    const { summaries } = await $fetch<SummarizeResponse>('/api/summarize', {
      body: {
        intent: store.buildSearchesResponse.intent,
        searchResults: store.relevantDocuments,
      } satisfies SummarizeBody,
      method: 'POST',
    });

    const filteredSummaries = summaries.filter((summary): summary is string => {
      // eslint-disable-next-line sonarjs/prefer-single-boolean-return -- this way is clearer
      if (
        !summary ||
        summary.length === 0 ||
        summary.includes('There is no information')
      ) {
        return false;
      }
      return true;
    });

    store.summaries = summaries;
    store.filteredSummaries = filteredSummaries;
  } catch (error) {
    console.error(error);
    store.summariesError = true;
  } finally {
    store.summariesLoading = false;
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

      await buildQueries({ query, store: this });
      if (this.buildSearchesError) {
        return;
      }

      await search({ query, store: this });
      if (this.searchResultsError) {
        return;
      }

      await filter({ query, store: this });
      if (this.filteredError) {
        return;
      }

      await summarize({ store: this });
      if (this.summariesError) {
        return;
      }

      await generateResponse({ query, store: this });
    },
  },

  getters: {
    sources: (state) => {
      if (state.searchResults && state.relevantDocuments) {
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
      buildSearchesResponse: undefined,
      filteredError: false,
      filteredLoading: undefined,
      filteredNumber: undefined,
      filteredResults: undefined,
      filteredSummaries: undefined,
      relevantDocuments: undefined,
      response: undefined,
      responseError: false,
      responseLoading: undefined,
      searchResults: undefined,
      searchResultsError: false,
      searchResultsLoading: undefined,
      summaries: undefined,
      summariesError: false,
      summariesLoading: undefined,
    };
  },
});
