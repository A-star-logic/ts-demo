// libs
import crypto from 'node:crypto';

/**
 * Generate a hash from a string.
 *
 * **Note: the algorithm used is not expected to obfuscate sensitive data**
 * @param root named parameters
 * @param root.string the string to hash
 * @returns a hashed string
 */
export async function getUnsafeHash({
  string,
}: {
  string: string;
}): Promise<string> {
  return crypto.createHash('SHA-256').update(string).digest('hex');
}
