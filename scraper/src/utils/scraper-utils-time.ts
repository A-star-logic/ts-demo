/**
 * Calculate the difference `end - start`
 * @param root named parameters
 * @param root.start the start date
 * @param root.end the end date
 * @returns the difference in seconds
 */
export async function dateDifference({
  end,
  start,
}: {
  end: Date;
  start: Date;
}): Promise<number> {
  const differenceInMilliseconds = end.getTime() - start.getTime();
  const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
  return differenceInSeconds;
}

/**
 * Wait
 * @param root named parameters
 * @param root.ms the number of milliseconds to wait
 */
export async function sleep({ ms }: { ms: number }): Promise<void> {
  await new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });
}
