const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
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
  if (user && user.email) {
    const [prefix] = user.email.split('@');
    user.email = `${prefix}@fake.com`;
  }
}
// First argument
const src = resolve(process.cwd(), process.argv[2] || 'db.jsonl');
// Second argument
const dest = resolve(process.cwd(), process.argv[3] || 'out.jsonl');
const file = readFileSync(src, 'utf-8');
const output = file
  .split('\n')
  .filter((str) => !!str) // remove last line
  .map((str) => JSON.parse(str))
  .map((json) => anonymize(json))
  .map((result) => JSON.stringify(result))
  .join('\n');
