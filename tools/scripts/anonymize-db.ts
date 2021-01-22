// tslint:disable: no-console
import 'tsconfig-paths/register';
import * as faker from 'faker';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { User, PublicUser, createPublicUser } from '@blockframes/user/types';
import { NotificationDocument } from '@blockframes/notification/types';
import { Invitation } from '@blockframes/invitation/+state';
import { DbRecord } from '@blockframes/firebase-utils';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { HostedVideo } from '@blockframes/movie/+state/movie.firestore';
import { createPublicOrganization, Organization } from '@blockframes/organization/+state/organization.model';
import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';

const userCache: { [uid: string]: User | PublicUser } = {};
const orgCache: { [id: string]: Organization | PublicOrganization } = {};

const fakeEmail = (name: string) =>
  `dev+${name.replace(/\W/g, '').toLowerCase()}-${Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 3)}@blockframes.io`;

function hasKeys<T extends object>(doc: object, ...keys: (keyof T)[]): doc is T {
  return keys.every((key) => key in doc);
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
    const newUser =  userCache?.[user.uid] || (userCache[user.uid] = processUser(user))
    return createPublicUser(newUser);
    // If not in cache, process the user, write to cache, make it a publicUser and return it
  } else if (hasKeys<User>(user, 'uid')) {
    return userCache?.[user.uid] || (userCache[user.uid] = processUser(user));
  }
  throw Error(`Unable to process user: ${JSON.stringify(user, null, 4)}`);
}

function updateOrg(org: Organization | PublicOrganization) {
  if (!org) return;
  if (hasKeys<PublicOrganization>(org, 'denomination') && !hasKeys<Organization>(org, 'email')) { // Is public
    const newOrg = orgCache?.[org.id] || (orgCache[org.id] = processOrg(org));
    return createPublicOrganization(newOrg);
  } else if (hasKeys<Organization>(org, 'email')) {
    return orgCache?.[org.id] || (orgCache[org.id] = processOrg(org));
  }
  throw Error(`Unable to process org: ${JSON.stringify(org, null, 4)}`);
}

function updateHostedVideo(screener: HostedVideo): HostedVideo {
  const jwPlayerId = 'qGEUNz1i';
  return {
    ...screener,
    jwPlayerId
  }
}

function processMovie(movie: Movie): Movie {
  if (movie.promotional?.videos?.screener) {
    movie.promotional.videos.screener = updateHostedVideo(movie.promotional.videos.screener);
  }
  if (movie.promotional?.videos?.otherVideos) {
    movie.promotional.videos.otherVideos = movie.promotional.videos.otherVideos.map(updateHostedVideo);
  }
  return movie;
}

function anonymizeDocument({ docPath, content: doc }: DbRecord) {
  const ignorePaths = [
    '_META/',
    'blockframesAdmin/',
    'contracts/',
    'docsIndex/',
    'events/',
    'cms/',
    'campaigns/',
    'permissions/',
    'publicContracts/',
  ];
  if (!doc || ignorePaths.some((path) => docPath.includes(path))) return { docPath, content: doc };

  try {
    if (docPath.includes('users/') && hasKeys<User>(doc, 'uid') && doc?.email) { // USERS
      return { docPath, content: updateUser(doc) };
    } else if (docPath.includes('orgs/') && hasKeys<Organization>(doc, 'id', 'denomination')) { // ORGS
      return { docPath, content: updateOrg(doc) };
    } else if (docPath.includes('invitations/') && hasKeys<Invitation>(doc, 'type', 'status', 'mode')) { // INVITATIONS
      return { docPath, content: processInvitation(doc) };
    } else if (docPath.includes('notifications/') && hasKeys<NotificationDocument>(doc, 'toUserId')) { // NOTIFICATIONS
      return { docPath, content: processNotification(doc) };
    } else if (docPath.includes('movies/') ) {
      if (hasKeys<Movie>(doc, 'title')) return { docPath, content: processMovie(doc) };
      return { docPath, content: doc };
    }
  } catch (e) {
    throw [Error(`Error docPath: ${docPath}`), e];
  }
  const error = 'CRITICAL: could not clean a document, docPath not handled';
  const location = `Document path: ${docPath}`;
  const solution = 'The collection name might be missing in the anonymisation script. Update file tools/scripts/anonymize-db.ts';
  throw new Error([error, location, solution].join('/n'));
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
