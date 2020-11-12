import { db, functions } from '../internals/firebase'
import { EventContext, RuntimeOptions } from 'firebase-functions';
import { Message } from 'firebase-functions/lib/providers/pubsub';
import { Bucket } from '@google-cloud/storage';
import { clear, exportFirestoreToBucket, getBackupBucket, restoreFromBackupBucket } from '@blockframes/firebase-utils';
import { heavyConfig } from '../main';

type PubsubHandler = (message: Message, context: EventContext) => any

const firestorePubsubHandler: PubsubHandler = async (message) => {
  const command = message.data ? Buffer.from(message.data, 'base64').toString() : null;
  try {
    if (command === 'export') {
      const bucket: Bucket = await getBackupBucket();
      return exportFirestoreToBucket(db, bucket);
    } else if (command === 'import') {
      const bucket = await getBackupBucket();
      const file = message.attributes.file;
      return restoreFromBackupBucket(bucket, db, file);
    } else if (command === 'clear') {
      return clear(db);
    }
  } catch (e) {
    console.error('ERROR', e);
    return Promise.reject();
  }
  console.error('Command not recognised');
  return Promise.reject();
};

export const firestorePubsub = functions.runWith(heavyConfig).pubsub.topic('firestore').onPublish(firestorePubsubHandler)
