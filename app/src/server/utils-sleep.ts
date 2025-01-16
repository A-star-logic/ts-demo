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
