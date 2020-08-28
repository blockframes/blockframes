import { readFileSync } from 'fs';

export interface JsonlDbRecord {
  docPath: string;
  content: { [key: string]: any };
}

export function readJsonlFile(dbBackupPath: string) {
  const file = readFileSync(dbBackupPath, 'utf-8');
  return file
    .split('\n')
    .filter((str) => !!str) // remove last line
    .map((str) => JSON.parse(str) as JsonlDbRecord);
}
/**
 *
 * @param vars This is an array of tuples `[varName, msg]` - the `varName` is the name
 * of the required environment variable, and `msg` is the message or link you want to
 * show if the preceding variable is missing.
 */
export function checkEnv(vars: [string, string][], { throwError }) {
  const results = vars.map(([varName, msg]) => {
    return {
      varName,
      msg,
      exists: process.env?.[varName],
    };
  });
  results.forEach(({ varName, msg, exists }) => {
    if (exists) return;
    let output = `A required environment variable is missing.\nName: "${varName}"\n`;
    output += `More info: ${msg}\n\n`;
    console.warn(output);
  });
  if (throwError && results.filter((res) => !res.exists).length) throw Error();
}
