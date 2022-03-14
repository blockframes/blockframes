import { Event, MeetingEvent } from '@blockframes/model';
import { Firestore } from '@blockframes/firebase-utils';
import { StorageFile } from '@blockframes/media/+state/media.firestore';
import { get } from 'lodash';
import { runChunks } from '../firebase-utils';
import { OldMeeting } from './old-types';


export async function upgrade(db: Firestore) {

  const meetings = await db.collection('events').where('type', '==', 'meeting').get();

  /*
    Media Refactoring for meetings files:
    `string` -> `StorageFile`
  */
  return runChunks(meetings.docs, async (meetingDoc) => {
    const meeting = meetingDoc.data() as Event<OldMeeting>;

    if (meeting.meta.files) {

      const filesPromises = meeting.meta.files.map(async ref => {

        const segments = ref.split('/').filter(part => !!part);
        const privacy = segments.shift();
        const collection = segments.shift();
        const docId = segments.shift();
        const fileName = segments.pop();
        const field = segments.join('.');

        if (!privacy || !collection || !docId || !field || !fileName) return;

        const docSnap = await db.collection(collection).doc(docId).get();
        if (!docSnap.exists) return;

        const doc = docSnap.data();
        const storageFile: StorageFile | StorageFile[] | undefined = get(doc, field);

        if (Array.isArray(storageFile)) {
          if (storageFile.length === 0) return;

          const storagePath = `${collection}/${docId}/${field}/${fileName}`;
          return storageFile.find(storage => storage.storagePath === storagePath);
        } else {
          return storageFile;
        }
      });
      const files = await Promise.all(filesPromises);
      // convert old event into new event
      (meeting as unknown as MeetingEvent).meta.files = files.filter(file => !!file);
    }
    meeting.meta.selectedFile = '';
    await meetingDoc.ref.set(meeting);
  });
}
