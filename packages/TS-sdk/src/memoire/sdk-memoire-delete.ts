import { fetchRequest } from '../client';

interface SearchDeleteBody {
  documentIDs: string[];
}
/**
 * Delete documents from Memoire
 * @param root named parameters
 * @param root.documentIDs Ids of the documents to delete
 */
export async function deleteDocuments({
  documentIDs,
}: {
  documentIDs: SearchDeleteBody['documentIDs'];
}): Promise<void> {
  const start = Date.now();

  const response = await fetchRequest('/search/documents', {
    body: JSON.stringify({ documentIDs }),
    method: 'DELETE',
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
