/**
 * Try to parse a json string, and return undefined if the parsing failed.
 * @param root named parameters
 * @param root.json the json to parse
 * @returns a json object if the parsing was successful, undefined otherwise
 */
export async function attemptJSONParsing<T>({
  json,
}: {
  json: null | string;
}): Promise<T | undefined> {
  if (json === null) {
    console.error('JSON Parsing error: input was null');
    return undefined;
  }
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return undefined;
  }
}
