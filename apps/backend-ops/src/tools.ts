export function showHelp() {
  console.log('TODO: write a documentation');
}

export const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

