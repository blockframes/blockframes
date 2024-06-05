import { dbVersionDoc, META_COLLECTION_NAME } from "@blockframes/utils/maintenance";
import { firebase } from '@env';
import { throwOnProduction, versionRef } from '@blockframes/firebase-utils';
import { runShellCommandExec } from '../commands';

/**
 * This function uses firebase CLI to clear firestore, but excludes the maintenance doc
 * ie: META_COLLECTION_NAME/MAINTENANCE_DOCUMENT_NAME
 * @param db firestore object
 */
export async function clearDb(db: FirebaseFirestore.Firestore, allowProd = false) {
  if (!allowProd) throwOnProduction();
  const collections = (await db.listCollections()).filter((ref) => ref.id !== META_COLLECTION_NAME).map(ref => ref.id);
  const cmds = collections.map(collection => `firebase firestore:delete -P ${firebase().projectId} -r -f ${collection}`);
  let retriesLeft = 10;
  for (const cmd of cmds) {
    try {
      await runShellCommandExec(cmd);
    } catch (e) {
      /** @see https://firebase.google.com/docs/firestore/transaction-data-contention?hl=fr#transactions_and_data_contention*/
      if (e.status === 409) {
        console.log(`Command "${cmd}" failed with HTTP Error: 409, Too much contention on these documents. Please try again.`);
      } else {
        console.error(e);
      }

      if (retriesLeft === 0) {
        throw new Error(`Command "${cmd}" failed and no more retries left..`);
      } else {
        retriesLeft--;
        console.log(`Command "${cmd}" failed and will be retryied... ${retriesLeft} retries left`);
        cmds.push(cmd);
      }
    }

  }
  await versionRef(db).delete();
  console.log(`Deleted ${dbVersionDoc}`);
}
