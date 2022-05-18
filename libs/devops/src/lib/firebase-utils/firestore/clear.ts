import { DB_DOCUMENT_NAME, META_COLLECTION_NAME } from "@blockframes/utils/maintenance";
import { firebase } from '@env';
import { throwOnProduction } from '@blockframes/firebase-utils';
import { runShellCommandExec } from '../commands';

/**
 * This function uses firebase CLI to clear firestore, but excludes the maintenance doc
 * ie: META_COLLECTION_NAME/MAINTENANCE_DOCUMENT_NAME
 * @param db firestore object
 */
export async function clearDb(db: FirebaseFirestore.Firestore) {
  throwOnProduction();
  const collections = (await db.listCollections()).filter((ref) => ref.id !== META_COLLECTION_NAME).map(ref => ref.id);
  const cmds = collections.map(collection => `firebase firestore:delete -P ${firebase().projectId} -r -y ${collection}`)
  for (const cmd of cmds) {
    await runShellCommandExec(cmd);
  }
  await db.collection(META_COLLECTION_NAME).doc(DB_DOCUMENT_NAME).delete()
  console.log(`Deleted ${DB_DOCUMENT_NAME} in ${META_COLLECTION_NAME}`)
}
