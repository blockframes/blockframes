import { Writable } from 'stream';
// @ts-ignore: @types/jsonlines does not exist yet.
import * as admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage';
import { db } from './firebase';

const BACKUP_BUCKET = 'blockframes-backups'; // TODO: secure access to this bucket.

type CollectionReference = admin.firestore.CollectionReference;
type QuerySnapshot = admin.firestore.QuerySnapshot;
type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;

interface StoredDocument {
  docPath: string;
  content: any;
}

class Queue {
  content: string[];

  constructor() {
    this.content = [];
  }

  push(x: string) {
    this.content.push(x);
  }

  pop(): null | string {
    if (this.content.length === 0) {
      return null;
    }
    return this.content.shift()!;
  }
}

const getBackupBucket = async (): Promise<Bucket> => {
  const bucket: Bucket = admin.storage().bucket(BACKUP_BUCKET);
  const exists = await bucket.exists();

  // The api returns an array.
  if (!exists[0]) {
    await bucket.create();
  }

  return bucket;
};

const getBackupOutput = async (bucket: Bucket, name: string): Promise<Writable> => {
  const blob = bucket.file(`${name}.jsonl`);
  return blob.createWriteStream({ resumable: false });
};

const freeze = async (req: any, resp: any) => {
  // Prep ouput
  const now = (new Date()).toISOString();
  const bucket: Bucket = await getBackupBucket();
  const stream = await getBackupOutput(bucket, now);

  const processingQueue = new Queue();

  // retrieve all the collections at the root.
  const collections: CollectionReference[] = await db.listCollections();

  // We go through each collection and retrieve its documents.
  const promises = collections.map(async collection => {
    const q: QuerySnapshot = await collection.get();

    console.error('Processing collection:', collection.path);

    q.docs.forEach((doc: QueryDocumentSnapshot) => {

      // Store the data
      const docPath: string = doc.ref.path;
      const content: any = doc.data();
      const stored: StoredDocument = { docPath, content };

      console.error('Storing document:', docPath);
      stream.write(JSON.stringify(stored));
      stream.write('\n');

      processingQueue.push(docPath);
      // TODO: recursive descent
    });
  });

  console.error('Waiting for all processings to complete');
  await Promise.all(promises);

  console.error('Done, closing our stream');
  await new Promise(resolve => {
    stream.end(resolve);
  });

  console.error('Finally');
  return resp.status(200).send('success');
};

const restore = async () => {
  return true;
};

export { freeze, restore };
