import { readFileSync } from 'fs';
import requiredVars from 'tools/mandatory-env-vars.json';

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

export function warnMissingVars(): void | never {
  const warn = (key: string, msg: string) => {
    console.warn(`Please ensure the following variable is set in .env : ${key}`);
    console.warn(`More info: ${msg}\n`);
  };
  requiredVars.map(({ key, msg }: { key: string; msg: string }) => process.env?.[key] ?? warn(key, msg));
}
