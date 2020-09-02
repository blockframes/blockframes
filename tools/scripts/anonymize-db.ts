import * as faker from 'faker';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function anonymize({ docPath, content }) {
  // USERS
  if (docPath.includes('users/')) {
    updateEmail(content);
  }
  // ORGS
  if (docPath.includes('orgs/')) {
    updateEmail(content);
  }
  // INVITATIONS
  if (docPath.includes('invitations/')) {
    updateEmail(content.fromUser);
    updateEmail(content.toUser);
    updateEmail(content.user);
  }
  // NOTIFICATIONS
  if (docPath.includes('notifications/')) {
    updateEmail(content.fromUser);
    updateEmail(content.toUser);
    updateEmail(content.user);
  }
  return { docPath, content };
}
function updateEmail(user) {
  if (user?.email) {
    const rand = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 3);
    const name = faker.name.firstName().replace(/\W/g, '').toLowerCase();
    user.email = `dev+${name}-${rand}@cascade8.com`;
  }
}
// First argument
const src = resolve(process.cwd(), process.argv[2] || 'tmp/backup-prod.jsonl');
// Second argument
const dest = resolve(process.cwd(), process.argv[3] || 'tmp/restore-ci.jsonl');
const file = readFileSync(src, 'utf-8');
const output = file
  .split('\n')
  .filter((str) => !!str) // remove last line
  .map((str) => JSON.parse(str))
  .map((json) => anonymize(json))
  .map((result) => JSON.stringify(result))
  .join('\n');
writeFileSync(dest, output, 'utf-8');
