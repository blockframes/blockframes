import { DB_DOCUMENT_NAME, META_COLLECTION_NAME } from "@blockframes/utils/maintenance";
import { runChunks } from "../firebase-utils";
import { Queue } from "../queue";
import { CollectionReference, DocumentReference, Firestore } from "../types";
import { firebase } from '@env';
import { throwOnProduction } from "../util";
import { execSync } from "child_process";

export async function clear(db: FirebaseFirestore.Firestore) {
  const processingQueue = new Queue();

  // Note: this code is heavily inspired by the backup function,
  // @TODO (#3512) & implement a generalized way to go through all docs & collections
  // and use it in both functions.
  // retrieve all the collections at the root.
  const collections: CollectionReference[] = await clearedCollection(db);
  collections.forEach(x => processingQueue.push(x.path));

  while (!processingQueue.isEmpty()) {
    const currentPath: string = processingQueue.pop();
    const docs: DocumentReference[] = await db.collection(currentPath).listDocuments();

    // keep all docs subcollection to be deleted to,
    // delete every doc content.
    await runChunks(docs, async (doc: any) => {
      // Adding the current path to the subcollections to backup
      const subCollections = await doc.listCollections();
      subCollections.forEach((x: any) => processingQueue.push(x.path));

      // Delete the document
      return doc.delete();
    }, 500, false);
  }

  return true;
}

/**
 * Return all collection in the firestore instance provided, skip the collections
 * that should not be clear'd.
 * @param firestore
 */
const clearedCollection = async (firestore: Firestore): Promise<CollectionReference[]> => {
  // NOTE: this is legacy code, once upon a time we'd skip the backup of the _restore / _META collection
  // we disabled that, and this function might be useless now.
  return (await firestore.listCollections()).filter(x => x.id !== META_COLLECTION_NAME);
};

/**
 * This function uses firebase CLI to clear firestore, but excludes the maintenance doc
 * ie: META_COLLECTION_NAME/MAINTENANCE_DOCUMENT_NAME
 * @param db firestore object
 */
export async function clearDbCLI(db: FirebaseFirestore.Firestore) {
  throwOnProduction();
  const collections = (await db.listCollections()).map((ref) => ref.id).filter((name) => name !== META_COLLECTION_NAME);
  const cmds = collections.map(collection => `firebase firestore:delete -P ${firebase().projectId} -r -y ${collection}`)
  for (const cmd of cmds) {
    console.log('Run:', cmd);
    execSync(cmd);
  }
  await db.collection(META_COLLECTION_NAME).doc(DB_DOCUMENT_NAME).delete()
  console.log(`Deleted ${DB_DOCUMENT_NAME} in ${META_COLLECTION_NAME}`)
}
