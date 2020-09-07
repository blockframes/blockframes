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

type Id = string;
const newUsers: Record<Id, User | PublicUser> = {};
const newOrgs: Record<Id, Organization | PublicOrganization> = {};

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

function processUser<T extends User | PublicUser>(u: T): T {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = fakeEmail(firstName);
  return { ...u, firstName, lastName, email };
}

function processOrg<T extends Organization | PublicOrganization>(o: T): T {
  const companyName = faker.company.companyName();
  const denomination = { full: companyName, public: companyName };
  const email = fakeEmail(companyName);
  return { ...o, denomination, email };
}

function processInvitation(i: Invitation): Invitation {
  return {
    ...i,
    fromOrg: updateOrg(i.fromOrg),
    toOrg: updateOrg(i.toOrg),
    fromUser: updateUser(i.fromUser),
    toUser: updateUser(i.toUser),
  };
}

function processNotification(n: NotificationDocument): NotificationDocument {
  return {
    ...n,
    organization: updateOrg(n.organization),
    user: updateUser(n.user as PublicUser), // ! TODO: If possible don't use Partial in this type!
  };
}

function updateUser(user: User | PublicUser) {
  if (!user) return;
  if (hasKeys<PublicUser>(user, 'uid') && !hasKeys<User>(user, 'watermark')) { // Is public
    return createPublicUser( newUsers?.[user.uid] || (newUsers[user.uid] = processUser(user)));
    // If not in cache, process the user, write to cache, make it a publicUser and return it
  } else if (hasKeys<User>(user, 'uid')) {
    return newUsers?.[user.uid] || (newUsers[user.uid] = processUser(user));
  }
  throw Error(`Unable to process user: ${JSON.stringify(user, null, 4)}`);
}

function updateOrg(org: Organization | PublicOrganization) {
  if (!org) return;
  if (hasKeys<PublicOrganization>(org, 'denomination') && !hasKeys<Organization>(org, 'email')) { // Is public
    return createPublicOrganization(newOrgs?.[org.id] || (newOrgs[org.id] = processOrg(org))
    );
  } else if (hasKeys<Organization>(org, 'email')) {
    return newOrgs?.[org.id] || (newOrgs[org.id] = processOrg(org));
  }
  throw Error(`Unable to process org: ${JSON.stringify(org, null, 4)}`);
}

function anonymizeDocument({ docPath, content: doc }: JsonlDbRecord) {
  // function pathHasAny(path: string) { return docPath.includes(path) }
  function pathHasAny(...paths: string[]) {
    return !paths.every((path) => !docPath.includes(path));
  }
  const ignorePaths = [
    '_META/',
    'blockframesAdmin/',
    'contracts/',
    'docsIndex/',
    'events/',
    'movies/',
    'permissions/',
    'publicContracts/',
  ];
  if (!doc || pathHasAny(...ignorePaths)) return { docPath, content: doc };

  try {
    if (pathHasAny('users/') && hasKeys<User>(doc, 'uid') && doc?.email) { // USERS
      return { docPath, content: updateUser(doc) };
    } else if (pathHasAny('orgs/') && hasKeys<Organization>(doc, 'id', 'denomination')) { // ORGS
      return { docPath, content: updateOrg(doc) };
    } else if (pathHasAny('invitations/') && hasKeys<Invitation>(doc, 'type', 'status', 'mode')) { // INVITATIONS
      return { docPath, content: processInvitation(doc) };
    } else if (pathHasAny('notifications/') && hasKeys<NotificationDocument>(doc, 'isRead')) { // NOTIFICATIONS
      return { docPath, content: processNotification(doc) };
    }
  } catch (e) {
    throw [Error(`Error docPath: ${docPath}`), e];
  }
  throw Error(
    `CRITICAL: could not clean this document! Path: ${docPath} \ncontent:\n${JSON.stringify(doc, null, 4)}`
  );
}

function getPathOrder(path: string): number {
  if (path.includes('users/')) return 1;
  if (path.includes('orgs/')) return 2;
  if (path.includes('invitations/')) return 3;
  if (path.includes('notifications/')) return 4;
  return 5;
}

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
