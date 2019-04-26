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

  pop(): string {
    if (this.content.length === 0) {
      throw new Error('popping from an empty queue');
    }
    return this.content.shift()!;
  }

  isEmpty(): boolean {
    return this.content.length === 0;
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

  // Note: we use a Queue to store the collections to backup instead of doing a recursion,
  // this will protect the stack. It will break when the size of keys to backup grows
  // larger than our memory quota (memory is around 500mo => around 50GB of firestore data to backup)
  // We'll have to store them in a collection at this point.
  const processingQueue = new Queue();

  // retrieve all the collections at the root.
  const collections: CollectionReference[] = await db.listCollections();
  collections.forEach(x => processingQueue.push(x.path));

  while (!processingQueue.isEmpty()) {
    const currentPath: string = processingQueue.pop();
    const q: QuerySnapshot = await db.collection(currentPath).get();

    if (q.size > 0) {
      console.info('Processing collection:', currentPath);
    } else {
      // Empty, move on
      continue;
    }

    // Go through each document of the collection for backup
    const promises = q.docs.map(async (doc: QueryDocumentSnapshot) => {
      // Store the data
      const docPath: string = doc.ref.path;
      const content: any = doc.data();
      const stored: StoredDocument = { docPath, content };

      console.error('Storing document:', docPath);
      stream.write(JSON.stringify(stored));
      stream.write('\n');

      // Adding the current path to the subcollections to backup
      const subCollections = await doc.ref.getCollections();
      subCollections.forEach(x => processingQueue.push(x.path));
    });

    // Wait for this backup to complete
    await Promise.all(promises);
  }

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
