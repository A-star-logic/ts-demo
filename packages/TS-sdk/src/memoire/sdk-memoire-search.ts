import { fetchRequest } from '../client';

interface SearchBody {
  maxResults?: number;
  query: string;
}

interface SearchResponse {
  results: {
    content: string;
    documentID: string;
    highlights?: string;
    metadata: object;
    score: number;
    title?: string;
  }[];
}

/**
 * Execute a search with Memoire
 * @param root named parameters
 * @param root.maxResults the maximum number of results to return
 * @param root.query the search query
 * @returns the search results
 */
export async function search({
  maxResults,
  query,
}: SearchBody): Promise<SearchResponse['results']> {
  const start = Date.now();

  const response = await fetchRequest('/search', {
    body: JSON.stringify({ maxResults, query }),
    method: 'POST',
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
