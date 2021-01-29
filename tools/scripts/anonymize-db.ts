// tslint:disable: no-console
import 'tsconfig-paths/register';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { anonymizeDocument, DbRecord, getPathOrder } from '@blockframes/firebase-utils';

// First argument
const src = resolve(process.cwd(), process.argv[2] || 'tmp/backup-prod.jsonl');
// Second argument
const dest = resolve(process.cwd(), process.argv[3] || 'tmp/restore-ci.jsonl');
const file = readFileSync(src, 'utf-8');
const msg = 'Db anonymization time';
console.time(msg);
const db: DbRecord[] = file
  .split('\n')
  .filter((str) => !!str)
  .map((str) => JSON.parse(str) as DbRecord);
const output = db
  .sort((a, b) => getPathOrder(a.docPath) - getPathOrder(b.docPath))
  .map((json) => anonymizeDocument(json))
  .map((result) => JSON.stringify(result))
  .join('\n');
writeFileSync(dest, output, 'utf-8');
console.timeEnd(msg);
