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
