import { chunk } from "lodash";

/**
 * Transform a regular function into a function that stop the process.
 * Uses this to run commands from the CLI. Works with promises too.
 *
 * @param f
 */
export const exitable = (f: () => Promise<any | void>) => {
  return () =>
    f()
      .then(() => process.exit(0))
      .catch(e => {
        console.error(e);
        process.exit(1);
      });
};

export function showHelp() {
  console.log('TODO: write a documentation');
}

export async function runChunks(docs, cb, rowsConcurrency = 10, verbose = true) {
  const chunks = chunk(docs, rowsConcurrency);
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    if (verbose) { console.log(`Processing chunk ${i + 1}/${chunks.length}`); }
    const promises = c.map(cb);
    await Promise.all(promises);
  }
}