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

export const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};
