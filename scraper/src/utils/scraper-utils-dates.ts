import { DateTime, Duration } from 'luxon';

/**
 * Attempt to map an llm output to an epoch date
 * @param root named parameters
 * @param root.string the string to parse
 * @returns the epoch in milliseconds, or undefined if the parsing failed
 */
export async function epochFromString({
  string,
}: {
  string: string;
}): Promise<number | undefined> {
  if (string === 'now') {
    return DateTime.now().toMillis();
  }
  if (string.endsWith('m') || string.endsWith('d') || string.endsWith('y')) {
    const unit = string.at(-1);
    const value = Number.parseInt(string.slice(0, -1));
    switch (unit) {
      case 'd': {
        return DateTime.now()
          .minus(Duration.fromObject({ days: value }))
          .toMillis();
      }
      case 'm': {
        return DateTime.now()
          .minus(Duration.fromObject({ month: value }))
          .toMillis();
      }
      case 'y': {
        return DateTime.now()
          .minus(Duration.fromObject({ years: value }))
          .toMillis();
      }
    }
  }
  try {
    const date = DateTime.fromISO(string);
    return date.toMillis();
  } catch (error) {
    console.error('epochFromString error:', error);
    return undefined;
  }
}
