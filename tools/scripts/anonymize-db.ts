// tslint:disable: no-console
import 'tsconfig-paths/register';
import * as faker from 'faker';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { User, PublicUser, createPublicUser } from '@blockframes/user/types';
import {
  Organization,
  createPublicOrganization,
  PublicOrganization,
} from '@blockframes/organization/+state';
import { NotificationDocument } from '@blockframes/notification/types';
import { Invitation } from '@blockframes/invitation/+state';
import { JsonlDbRecord } from '@blockframes/firebase-utils';

function throwError(e: any): never {
  throw e;
}

type Id = string;
const newUsers: Record<Id, User> = {};
const newOrgs: Record<Id, Organization> = {};

const fakeEmail = (name: string) =>
  `dev+${name.replace(/\W/g, '').toLowerCase()}-${Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 3)}@cascade8.com`;

function hasKeys<T extends object>(doc: object, ...keys: (keyof T)[]): doc is T {
  return keys.every((key) => key in doc);
}

function assertType<T extends object>(doc: any, ...keys: (keyof T)[]): asserts doc is T {
  if (hasKeys<T>(doc, ...keys)) throw Error('WRONG OBJECT TYPE!');
}

function processUser(u: User) {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = fakeEmail(firstName);
  return { ...u, firstName, lastName, email };
}

function processOrg(o: Organization) {
  const companyName = faker.company.companyName();
  const denomination = { full: companyName, public: companyName };
  const email = fakeEmail(companyName);
  return { ...o, denomination, email };
}

function updateUser(user: User | PublicUser /*private?: boolean*/) {
  if (!user) return;
  if (hasKeys<PublicUser>(user, 'uid') && !hasKeys<User>(user, 'watermark')) {
    // is public
    return createPublicUser(
      newUsers?.[user.uid] ?? processUser(user as User)
      // throwError(Error(`CORRESPONDING USER NOT FOUND: ${JSON.stringify(user)}`))
    );
  } else if (hasKeys<PublicUser>(user, 'uid')) {
    return newUsers?.[user.uid] || (newUsers[user.uid] = processUser(user));
  }
  throw Error(`Unable to process user: ${JSON.stringify(user)}`);
  // if (newUsers?.[user.uid]) {
  //   // Already set this user previously
  //   Object.assign(user, newUsers?.[user.uid]);
  // } else {
  //   // Process user
  //   const firstName = faker.name.firstName();
  //   const lastName = faker.name.lastName();
  //   const email = `dev+${firstName.replace(/\W/g, '').toLowerCase()}-${Math.random()
  //     .toString(36)
  //     .replace(/[^a-z]+/g, '')
  //     .substr(0, 3)}@cascade8.com`;
  //   Object.assign(user, { firstName, lastName, email });
  //   userTable.push([user.uid, user]);
  // }
}

function updateOrg(org: Organization | PublicOrganization) {
  if (!org) return;
  if (hasKeys<PublicOrganization>(org, 'denomination') && !hasKeys<Organization>(org, 'email')) {
    // This is already a public one. Find corresponding,
    return createPublicOrganization(
      newOrgs?.[org.id] ?? throwError(Error(`CORRESPONDING ORG NOT FOUND: ${JSON.stringify(org)}`))
    );
  } else if (hasKeys<Organization>(org, 'email')) {
    // Full org, process it
    return newOrgs?.[org.id] || (newOrgs[org.id] = processOrg(org));
  }
  throw Error(`Unable to process ORG: ${JSON.stringify(org)}`);
  // createPublicOrganization()
  // const foundOrgTuple = orgTable.find(([id]) => org.id === id);
  // if (foundOrgTuple) {
  //   const [, newOrg] = foundOrgTuple;
  //   Object.assign(org, newOrg);
  // } else {
  //   const companyName = faker.company.companyName();
  //   const denomination = {
  //     full: companyName,
  //     public: companyName,
  //   };
  //   org.denomination = denomination;
  //   org.email = `dev+${denomination.full.replace(/\W/g, '').toLowerCase()}-${Math.random()
  //     .toString(36)
  //     .replace(/[^a-z]+/g, '')
  //     .substr(0, 3)}@cascade8.com`;
  //   orgTable.push([org.id, org]);
  // }
}

function updateInvitation(invitation: Invitation): Invitation {
  return {
    ...invitation,
    fromOrg: updateOrg(invitation.fromOrg),
    toOrg: updateOrg(invitation.toOrg),
    fromUser: updateUser(invitation.fromUser),
    toUser: updateUser(invitation.toUser),
  };
}

function updateNotification(notification: NotificationDocument): NotificationDocument {
  return {
    ...notification,
    organization: updateOrg(notification.organization),
    user: updateUser(notification.user as PublicUser),
  };
}

function getPathOrder(path: string): number {
  if (path.includes('users/')) return 1;
  if (path.includes('orgs/')) return 2;
  if (path.includes('invitations/')) return 3;
  if (path.includes('notifications/')) return 4;
  return 5;
}

// type anonymizeDocument = (doc: JsonlDbRecord) => JsonlDbRecord;
function anonymizeDocument({ docPath, content: doc }: JsonlDbRecord) {
  if (
    !doc ||
    docPath.includes('_META/') ||
    docPath.includes('blockframesAdmin/') ||
    docPath.includes('contracts/') ||
    docPath.includes('docsIndex/') ||
    docPath.includes('events/') ||
    docPath.includes('movies/') ||
    docPath.includes('permissions/') ||
    docPath.includes('publicContracts/')
  )
    return { docPath, content: doc };

  try {
    if (docPath.includes('users/') && hasKeys<User>(doc, 'uid') && doc?.email) {
      // USERS
      return { docPath, content: updateUser(doc) };
    } else if (docPath.includes('orgs/') && hasKeys<Organization>(doc, 'id', 'denomination')) {
      // ORGS
      return { docPath, content: updateOrg(doc) };
    } else if (
      docPath.includes('invitations/') &&
      hasKeys<Invitation>(doc, 'type', 'status', 'mode')
    ) {
      // INVITATIONS
      return { docPath, content: updateInvitation(doc) };
    } else if (docPath.includes('notifications/') && hasKeys<NotificationDocument>(doc, 'isRead')) {
      // NOTIFICATIONS
      // assertType<NotificationDocument>(content, 'organization')
      return { docPath, content: updateNotification(doc) };
    }
  } catch (e) {
    throw [Error(`Error docPath: ${docPath}`), e];
  }
  throw Error(
    `CRITICAL: could not clean this document! Path: ${docPath} \ncontent:\n${JSON.stringify(doc)}`
  );
}

// function updateDocument(doc: User | Organization) {
//   if (!doc) return;
//   if (hasKeys<User>(doc, 'uid') && doc?.email) updateUser(doc);
//   else if (hasKeys<Organization>(doc, 'id', 'denomination')) updateOrg(doc);
//   else if (doc?.email)
//     throw Error(`CRITICAL: could not clean production email data!!\n${JSON.stringify(doc)}`);
// }

// First argument
const src = resolve(process.cwd(), process.argv[2] || 'tmp/backup-prod.jsonl');
// Second argument
const dest = resolve(process.cwd(), process.argv[3] || 'tmp/restore-ci.jsonl');
const file = readFileSync(src, 'utf-8');
const msg = 'Db anonymization time';
console.time(msg);
const db: JsonlDbRecord[] = file
  .split('\n')
  .filter((str) => !!str)
  .map((str) => JSON.parse(str) as JsonlDbRecord);
const output = db
  .sort((a, b) => getPathOrder(a.docPath) - getPathOrder(b.docPath))
  .map((json) => anonymizeDocument(json))
  .map((result) => JSON.stringify(result))
  .join('\n');
writeFileSync(dest, output, 'utf-8');
console.timeEnd(msg);
