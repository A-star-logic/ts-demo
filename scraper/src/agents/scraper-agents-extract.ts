/**
 * Request an agent to extract redundant data from a sample of multiple web pages.
 *
 * The goal of this agent is to find data that is the same on multiple pages (such as navbars, footers, etc.),
 *  and provide one of multiple strings to remove from any subsequent pages.
 * @param root named parameters
 * @param root.sample a sample of multiple webpages
 * @returns a list of strings to remove
 */
export async function extractRedundantData({
  sample,
}: {
  sample: string[];
}): Promise<string[]> {
  return sample;
}
