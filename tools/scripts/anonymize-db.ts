// tslint:disable: no-console
import * as faker from 'faker';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { User } from '@blockframes/user/types';
import { Organization } from '@blockframes/organization/+state';
import { NotificationDocument } from '@blockframes/notification/types';

const userTable: [string, User][] = []; // uid, newEmail
const orgTable: [string, Organization][] = []; // uid, newOrg

function isA<T>(doc: any, ...keys: string[]): doc is T {
  for (const key of keys) if (!(key in doc)) return false;
  return true;
}

function assertType<T>(doc: any, ...keys: string[]): asserts doc is T {
  for (const key of keys) if (!(key in doc)) throw Error('Wrong document type found!');
}

// function isOrg(doc: any): doc is Organization {
//   return 'denomination' in doc && 'id' in doc;
// }

// function isUser(doc: any): doc is User {
//   return 'uid' in doc;
// }

// function isA<T>(doc: { [key: string]: any }, ...keys: string[]): doc is T {
//   console.log(keys);
//   for (const key of keys) if (!doc.hasOwnProperty(key)) return false;
//   return true;
// }

function updateUser(user: User) {
  const foundUserTuple = userTable.find(([uid]) => user.uid === uid);
  if (foundUserTuple) {
    // Already set this user previously
    const [, newUser] = foundUserTuple;
    Object.assign(user, newUser);
  } else {
    // Process user
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = `dev+${firstName.replace(/\W/g, '').toLowerCase()}-${Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 3)}@cascade8.com`;
    Object.assign(user, { firstName, lastName, email });
    userTable.push([user.uid, user]);
  }
}

function updateOrg(org: Organization) {
  const foundOrgTuple = orgTable.find(([id]) => org.id === id);
  if (foundOrgTuple) {
    const [, newOrg] = foundOrgTuple;
    Object.assign(org, newOrg);
  } else {
    const companyName = faker.company.companyName();
    const denomination = {
      full: companyName,
      public: companyName,
    };
    org.denomination = denomination;
    org.email = `dev+${denomination.full.replace(/\W/g, '').toLowerCase()}-${Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 3)}@cascade8.com`;
    orgTable.push([org.id, org]);
  }
}

function anonymize({ docPath, content }) {
  // USERS
  if (docPath.includes('users/')) {
    updateDocument(content);
  }
  // ORGS
  if (docPath.includes('orgs/')) {
    updateDocument(content);
  }
  // INVITATIONS
  if (docPath.includes('invitations/')) {
    updateDocument(content.fromUser);
    updateDocument(content.fromOrg);
    updateDocument(content.toUser);
  }
  // NOTIFICATIONS
  if (docPath.includes('notifications/')) {
    // assertType<NotificationDocument>(content, 'organization')
    updateDocument(content.user);
    updateDocument(content.organization);
  }
  return { docPath, content };
}

function updateDocument(doc: User | Organization) {
  if (!doc) return;
  if (isA<User>(doc, 'uid') && doc?.email) updateUser(doc);
  else if (isA<Organization>(doc, 'id', 'denomination')) updateOrg(doc);
  else if (doc?.email)
    throw Error(`CRITICAL: could not clean production email data!!\n${JSON.stringify(doc)}`);
}

// First argument
const src = resolve(process.cwd(), process.argv[2] || 'tmp/backup-prod.jsonl');
// Second argument
const dest = resolve(process.cwd(), process.argv[3] || 'tmp/restore-ci.jsonl');
const file = readFileSync(src, 'utf-8');
const msg = 'Db anonymization time';
console.time(msg);
const output = file
  .split('\n')
  .filter((str) => !!str) // remove last line
  .map((str) => JSON.parse(str))
  .map((json) => anonymize(json))
  .map((result) => JSON.stringify(result))
  .join('\n');
writeFileSync(dest, output, 'utf-8');
console.timeEnd(msg);
