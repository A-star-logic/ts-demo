import { NodeHtmlMarkdown } from 'node-html-markdown';

/**
 * Convert html to markdown and filter kinks in text (e.g. multiple spaces)
 * @param root named parameters
 * @param root.html the html to convert to markdown
 * @returns a markdown string
 */
export async function htmlToMarkdown({
  html,
}: {
  html: string;
}): Promise<string> {
  const md = NodeHtmlMarkdown.translate(html);
  const clean = md
    // replace duplicate characters, avoid letter, numbers and slashes https://regex101.com/r/ufaBTA/1
    .replaceAll(/([^\d()/A-Za-z])\1+/g, '$1')
    .trim();
  return clean.replaceAll(/ +/g, ' ').trim();
}
