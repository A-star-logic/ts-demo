/**
 * Send a pre-made prompt for JSON output.
 *
 * **Note:** Because this prompt is generic but with some additional data, it is better to "sandwich" it: add it after static parts of the prompt, but before fully dynamic parts.
 * @param root named parameters
 * @param root.keys comma separated list of keys
 * @returns a pre-made prompt for JSON output
 */
export function JSONPrompt({ keys }: { keys: string }): string {
  const prompt = `
You need to respond with a JSON object.
The output will be used by a software, there is no need for newlines or spaces.
The JSON keys cannot be empty.
The JSON keys are: ${keys}
`;
  return prompt;
}
