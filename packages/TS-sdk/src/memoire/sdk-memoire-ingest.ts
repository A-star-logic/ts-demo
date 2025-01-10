import { fetchRequest } from '../client';

interface IngestRawBody {
  documents: {
    content: string;
    documentID: string;
    metadata?: object;
    title?: string;
  }[];
}

/**
 * Ingest a list of documents in Memoire
 * @param root named parameters
 * @param root.documents the list of documents to ingest
 */
export async function ingestRawDocuments({
  documents,
}: {
  documents: IngestRawBody['documents'];
}): Promise<void> {
  const start = Date.now();

  const response = await fetchRequest('/search/ingest/raw', {
    body: JSON.stringify({ documents }),
    method: 'POST',
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
