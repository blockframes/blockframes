
// External dependencies
import { get } from 'lodash';
import * as admin from 'firebase-admin';

// Blockframes dependencies
import { getDocument } from '@blockframes/firebase-utils';
import { Meeting, Screening } from '@blockframes/event/+state/event.firestore';
import { createPublicUser } from '@blockframes/user/types';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

// Internal dependencies
import { db } from './firebase';
import { isUserInvitedToEvent } from './invitations/events';

export async function isAllowedToAccessMedia(file: StorageFile, uid: string, eventId?: string): Promise<boolean> {

  const user = await db.collection('users').doc(uid).get();
  if (!user.exists) { return false; }
  const userDoc = createPublicUser(user.data());

  const blockframesAdmin = await db.collection('blockframesAdmin').doc(uid).get();
  if (blockframesAdmin.exists) { return true; }

  // We should not trust `privacy` & `storagePath` that comes from the parameters
  // instead we use `collection`, `docId` & `field` to retrieve the trusted values form the db
  const docData = await getDocument(`${file.collection}/${file.docId}`);
  const storageFile: StorageFile | undefined = get(docData, file.field);
  if (!storageFile) { return false; }
  const { privacy, storagePath } = storageFile;

  if (privacy === 'public') { return true; }

  let canAccess = false;
  switch (file.collection) {
    case 'users':
      canAccess = file.docId === uid;
      break;
    case 'orgs':
      if (!userDoc.orgId) { return false; }
      canAccess = file.docId === userDoc.orgId;
      break;
    case 'movies':
      if (!userDoc.orgId) { return false; }
      const moviesCol = await db.collection('movies').where('orgIds', 'array-contains', userDoc.orgId).get();
      const movies = moviesCol.docs.map(doc => doc.data());
      const orgIds = movies.map(m => m.orgIds)
      canAccess = orgIds.some(id => file.docId === id);
      break;
    default:
      canAccess = false;
      break;
  }

  // use is not currently authorized,
  // but he might be invited to an event where the file is shared
  if (!canAccess && !!eventId) {
    const eventRef = db.collection('events').doc(eventId);
    const eventSnap = await eventRef.get();

    if (eventSnap.exists) {

      const eventData = eventSnap.data()!;

      const now = admin.firestore.Timestamp.now();

      // check if meeting is ongoing (not too early nor too late)
      if (now.seconds < eventData.start.seconds || now.seconds > eventData.end.seconds) {
        return false;
      }

      // if event is a Meeting and has the file
      if (eventData.type === 'meeting') {

        // Check if the given file exists among the event's files
        const match = (eventData.meta as Meeting).files.some(eventFile =>
          eventFile.privacy === privacy && // trusted value from db
          eventFile.collection === file.collection &&
          eventFile.docId === file.docId &&
          eventFile.field === file.field &&
          eventFile.storagePath === storagePath // trusted value from db
        );

        if (match) {
          // check if user is invited
          canAccess = await isUserInvitedToEvent(uid, eventId);
        }
      } else if (eventData.type === 'screening') {
        // only give access for this specific movie screener
        canAccess = file.field === 'promotional.screener'
          && file.docId === (eventData.meta as Screening).titleId;
      }
    }
  }

  return canAccess;
}
