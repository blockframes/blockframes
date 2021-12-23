import * as faker from 'faker';
import { User, PublicUser, createPublicUser } from '@blockframes/user/types';
import { NotificationDocument } from '@blockframes/notification/types';
import { Invitation } from '@blockframes/invitation/+state';
import { DbRecord, throwOnProduction } from '../util';
import { CollectionReference, QueryDocumentSnapshot, QuerySnapshot } from '../types';
import { Queue } from '../queue';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { createPublicOrganization, Organization } from '@blockframes/organization/+state/organization.model';
import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { FirestoreEmulator } from '../firestore/emulator';
import { firebase, testVideoId } from '@env'
import { runChunks } from '../firebase-utils';
import { IMaintenanceDoc } from '@blockframes/utils/maintenance';
import { firestore } from 'firebase-admin';
import { MovieVideo } from '@blockframes/movie/+state/movie.firestore';

const userCache: { [uid: string]: User | PublicUser } = {};
const orgCache: { [id: string]: Organization | PublicOrganization } = {};

export function fakeEmail(name: string) {
  const random = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 3);
  const suffix = name.replace(/\W/g, '').toLowerCase();
  return `dev+${suffix}-${random}@blockframes.io`;
}

function randomNumber() {
  return Math.floor(Math.random() * 255);
}

function fakeIp() {
  return (randomNumber() + 1) + "." + randomNumber() + "." + randomNumber() + "." + randomNumber();
}

function fakeFiscalNumber() {
  const fakeValues = ['FR', 'EN', 'PL', 'GB', 'AL'];
  const start = fakeValues[Math.floor(Math.random() * fakeValues.length)];
  return start + " " + randomNumber() + "-" + randomNumber() + "-" + randomNumber() + "-" + randomNumber();
}

function hasKeys<T extends Record<string, any>>(doc: Record<string, any>, ...keys: (keyof T)[]): doc is T {
  return keys.every((key) => key in doc);
}

function processUser<T extends User | PublicUser>(u: T): T {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = fakeEmail(firstName);
  const privacyPolicy = { date: new Date(), ip: fakeIp() };
  return { ...u, firstName, lastName, email, privacyPolicy };
}

function processOrg<T extends Organization | PublicOrganization>(o: T): T {
  const companyName = faker.company.companyName();
  const denomination = { full: companyName, public: companyName };
  const email = fakeEmail(companyName);
  const org = { ...o, denomination, email } as any;
  if (org.fiscalNumber) {
    org.fiscalNumber = fakeFiscalNumber();
  };
  return org;
}

function processInvitation(i: Invitation): Invitation {
  return {
    ...i,
    fromOrg: updateOrg(i.fromOrg),
    toOrg: updateOrg(i.toOrg),
    fromUser: updateUser(i.fromUser, true),
    toUser: updateUser(i.toUser, true),
  };
}

function processNotification(n: NotificationDocument): NotificationDocument {
  return {
    ...n,
    organization: updateOrg(n.organization),
    user: updateUser(n.user as PublicUser, true), // ! TODO: If possible don't use Partial in this type!
  };
}

function updateUser(user: User | PublicUser | Partial<User>, toPublicUser = false) {
  if (!user) return;
  if (hasKeys<User>(user, 'uid')) {
    const processedUser = userCache?.[user.uid] || (userCache[user.uid] = processUser(user));
    return toPublicUser ? createPublicUser(processedUser) : processedUser;
  }
  if (!hasKeys<User>(user, 'uid')) {
    console.warn('WARNING - user does not have UID!', user)
    return processUser(user as User);
  }
  throw Error(`Unable to process user: ${JSON.stringify(user, null, 4)}`);
}

function updateOrg(org: Organization | PublicOrganization) {
  if (!org) return;
  if (hasKeys<PublicOrganization>(org, 'denomination') && !hasKeys<Organization>(org, 'email')) { // Is public
    const newOrg = orgCache?.[org.id] || (orgCache[org.id] = processOrg(org));
    return createPublicOrganization(newOrg);
  }
  if (hasKeys<Organization>(org, 'email') || hasKeys<Organization>(org, 'fiscalNumber')) {
    return orgCache?.[org.id] || (orgCache[org.id] = processOrg(org));
  }
  throw Error(`Unable to process org: ${JSON.stringify(org, null, 4)}`);
}

function updateHostedVideo(screener: MovieVideo): MovieVideo {
  const jwPlayerId = testVideoId;
  return {
    ...screener,
    jwPlayerId
  }
}

function processMovie(movie: Movie): Movie {
  if (movie.promotional?.videos?.screener?.jwPlayerId) {
    movie.promotional.videos.screener = updateHostedVideo(movie.promotional.videos.screener);
  }
  if (movie.promotional?.videos?.otherVideos) {
    movie.promotional.videos.otherVideos = movie.promotional.videos.otherVideos.map(updateHostedVideo);
  }
  if (movie.promotional?.videos?.salesPitch?.jwPlayerId) {
    movie.promotional.videos.salesPitch = updateHostedVideo(movie.promotional.videos.salesPitch);
  }
  return movie;
}

function processMaintenanceDoc(doc: IMaintenanceDoc): IMaintenanceDoc {
  if (doc.startedAt && !doc.endedAt) return doc;
  return { endedAt: null, startedAt: firestore.Timestamp.now() }
}

export function anonymizeDocument({ docPath, content: doc }: DbRecord) {
  const ignorePaths = [
    'blockframesAdmin/',
    'contracts/',
    'docsIndex/',
    'events/',
    'cms/',
    'campaigns/',
    'permissions/',
    'analytics/',
    'buckets',
    'terms/',
    'incomes/',
    'offers/'
  ];
  if (!doc || ignorePaths.some((path) => docPath.includes(path))) return { docPath, content: doc };

  try {
    if (docPath.includes('users/') && hasKeys<User>(doc, 'uid') && doc?.email) { // USERS
      return { docPath, content: updateUser(doc) };
    }
    if (docPath.includes('orgs/') && hasKeys<Organization>(doc, 'id', 'denomination')) { // ORGS
      return { docPath, content: updateOrg(doc) };
    }
    if (docPath.includes('invitations/') && hasKeys<Invitation>(doc, 'type', 'status', 'mode')) { // INVITATIONS
      return { docPath, content: processInvitation(doc) };
    }
    if (docPath.includes('notifications/') && hasKeys<NotificationDocument>(doc, 'toUserId')) { // NOTIFICATIONS
      return { docPath, content: processNotification(doc) };
    }
    if (docPath.includes('movies/')) {
      if (hasKeys<Movie>(doc, 'title')) return { docPath, content: processMovie(doc) };
      return { docPath, content: doc };
    }
    if (docPath.includes('_META')) { // Always set maintenance
      if (hasKeys<IMaintenanceDoc>(doc, 'endedAt')) return { docPath, content: processMaintenanceDoc(doc) }
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

export async function runAnonymization(db: FirestoreEmulator) {
  throwOnProduction();
  const dbArray = await loadDb(db);
  const orderedDbArray = dbArray.sort((a, b) => getPathOrder(a.docPath) - getPathOrder(b.docPath))
  await db.clearFirestoreData({ projectId: firebase().projectId });
  const anonDb = orderedDbArray.map(anonymizeDocument)
  await runChunks(anonDb, async ({ content, docPath }) => { await db.doc(docPath).set(content) }, 1000)
  console.log('Anonymization Done!')
}

async function loadDb(db: FirebaseFirestore.Firestore) {
  const timerLabel = 'Firestore loaded';
  console.time(timerLabel); // eslint-disable-line no-restricted-syntax
  const output: DbRecord[] = [];
  // Note: we use a Queue to store the collections to backup instead of doing a recursion,
  // this will protect the stack. It will break when the size of keys to backup grows
  // larger than our memory quota (memory is around 500mo => around 50GB of firestore data to backup)
  // We'll have to store them in a collection at this point.
  const processingQueue = new Queue();

  // retrieve all the collections at the root.
  const collections: CollectionReference[] = await db.listCollections();
  collections.forEach(x => processingQueue.push(x.path));

  while (!processingQueue.isEmpty()) {
    // Note: we could speed up the code by processing multiple collections at once,
    // we push many promises to a "worker queue" and await them when it reaches a certain size
    // instead of using a while that blocks over every item.
    const currentPath: string = processingQueue.pop();
    const q: QuerySnapshot = await db.collection(currentPath).get();

    if (q.size === 0) {
      // Empty, move on
      continue;
    }

    // Go through each document of the collection for backup
    const promises = q.docs.map(async (doc: QueryDocumentSnapshot) => {
      // Store the data
      const docPath: string = doc.ref.path;
      const content: any = doc.data();
      const stored: DbRecord = { docPath, content };

      output.push(stored);

      // Adding the current path to the subcollections to backup
      const subCollections = await doc.ref.listCollections();
      subCollections.forEach(x => processingQueue.push(x.path));
    });

    // Wait for this backup to complete
    await Promise.all(promises);
    // This console.log is here to avoid "Too long with no output (exceeded 10m0s): context deadline exceeded" error from CircleCi
    console.log('Loading Firestore. Please wait ...');
  }
  console.timeEnd(timerLabel); // eslint-disable-line no-restricted-syntax
  return output;
}
