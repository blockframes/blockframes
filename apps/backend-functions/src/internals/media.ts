
// External dependencies
import { get } from 'lodash';
import * as admin from 'firebase-admin';

// Blockframes dependencies
import { getDocument } from '@blockframes/firebase-utils';
import { EventDocument, EventMeta, Meeting, Screening } from '@blockframes/event/+state/event.firestore';
import { createPublicUser } from '@blockframes/user/types';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

// Internal dependencies
import { db } from './firebase';
import { isUserInvitedToEvent } from './invitations/events';
import { MovieDocument } from '../data/types';
import { Privacy } from '@blockframes/utils/file-sanitizer';

export async function isAllowedToAccessMedia(file: StorageFile, uid: string, eventId?: string | EventDocument<EventMeta>, email?: string): Promise<boolean> {

  const eventData = eventId ? await getDocument<EventDocument<EventMeta>>(`events/${eventId}`) : undefined;

  let userDoc = createPublicUser({ uid, email });
  if (eventData?.accessibility === 'private') {
    const user = await db.collection('users').doc(uid).get();
    if (!user.exists) { return false; }
    userDoc = createPublicUser(user.data());
    if (!userDoc.orgId) { return false; }
  }

  const blockframesAdmin = await db.collection('blockframesAdmin').doc(uid).get();
  if (blockframesAdmin.exists) { return true; }

  // We should not trust `privacy` & `storagePath` that comes from the parameters
  // instead we use `collection`, `docId` & `field` to retrieve the trusted values form the db
  const docData = await getDocument(`${file.collection}/${file.docId}`);
  const storageFile: StorageFile | StorageFile[] | undefined = get(docData, file.field);

  let privacy: Privacy = 'protected';
  let storagePath = 'unknown';

  if (Array.isArray(storageFile)) {

    if (storageFile.length === 0) { return false; }

    const retrievedFile = storageFile.find(storage => storage.storagePath === file.storagePath);
    if (!retrievedFile) { return false; }

    privacy = retrievedFile.privacy;
    storagePath = retrievedFile.storagePath;

  } else {
    if (!storageFile) { return false; }
    privacy = storageFile.privacy;
    storagePath = storageFile.storagePath;
  }

  if (privacy === 'public') { return true; }

  let canAccess = false;
  switch (file.collection) {
    case 'users':
      canAccess = file.docId === uid;
      break;
    case 'orgs':
      canAccess = file.docId === userDoc.orgId;
      break;
    case 'movies':
      {
        const movieSnap = await db.collection('movies').doc(file.docId).get();
        if (!movieSnap.exists) { return false; }
        const movie = movieSnap.data() as MovieDocument;
        canAccess = movie.orgIds.some(id => userDoc.orgId === id);
        break;
      }
    default:
      canAccess = false;
      break;
  }

  // use is not currently authorized,
  // but he might be invited to an event where the file is shared
  if (!canAccess && eventData?.id) {

    const now = admin.firestore.Timestamp.now();

    // check if meeting is ongoing (not too early nor too late)
    if (now.seconds < eventData.start.seconds || now.seconds > eventData.end.seconds) {
      return false;
    }

    const isInvited = await isUserInvitedToEvent(uid, eventData, email);
    if (!isInvited) { return false; }

    // if event is a Meeting and has the file
    if (eventData.type === 'meeting') {

      // Check if the given file exists among the event's files
      canAccess = (eventData.meta as Meeting).files.some(eventFile =>
        eventFile.privacy === privacy && // trusted value from db
        eventFile.collection === file.collection &&
        eventFile.docId === file.docId &&
        eventFile.field === file.field &&
        eventFile.storagePath === storagePath // trusted value from db
      );

    } else if (eventData.type === 'screening') {
      // only give access for this specific movie screener
      canAccess = file.field === 'promotional.videos.screener'
        && file.docId === (eventData.meta as Screening).titleId;
    }
  }

  return canAccess;
}
