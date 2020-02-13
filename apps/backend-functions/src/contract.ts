import { functions, db } from './internals/firebase';
import { ContractDocument, PublicContractDocument } from './data/types';
import { ValidContractStatuses } from '@blockframes/contract/contract/+state/contract.firestore';
/**
 * 
 * @param contract 
 * @param deletedVersionId Used only when a version is removed from DB. We update public data with previous version.
 */
async function transformContractToPublic(contract: ContractDocument, deletedVersionId?: string): Promise<void> {
  return db.runTransaction(async tx => {
    const publicContractSnap = await tx.get(db.doc(`publicContracts/${contract.id}`));

    // Fetching the current version to compare it against deletedVersionId value
    const versionSnap = await tx.get(db.doc(`contracts/${contract.id}/versions/_meta`));
    // @TODO (#1887) using _meta to keep the id of the last version is too dangerous since triggers are not necessary in order.
    const versionDoc = versionSnap.data();
    let lastVersionDoc;
    if (!!versionDoc) {
      // If the current version is the one to skip/delete (deletedVersionId), we take the previous one to check its status
      const versionToFetch = !deletedVersionId || parseInt(deletedVersionId, 10) !== parseInt(versionDoc.count, 10)
        ? versionDoc.count
        // @TODO (#1887) Counting and assuming ids are sequential and ordered is too dangerous.
        // A solution should be to fetch all version ordered by id desc limit 1
        : parseInt(deletedVersionId, 10) - 1;

      const lastVersionSnap = await tx.get(db.doc(`contracts/${contract.id}/versions/${versionToFetch}`));
      lastVersionDoc = lastVersionSnap.data();
    }

    /** @dev public contract document is created only if its status is OK */
    if (lastVersionDoc && ValidContractStatuses.includes(lastVersionDoc.status)) {
      const publicContract: PublicContractDocument = {
        id: contract.id,
        type: contract.type,
        titleIds: contract.titleIds,
      };
      await tx.set(publicContractSnap.ref, publicContract)
    } else {
      /** @dev status is not OK, we delete public contract */
      await tx.delete(db.doc(`publicContracts/${contract.id}`));
    }
  });
}

export async function onContractWrite(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
): Promise<any> {

  const before = change.before.data();
  const after = change.after.data();

  if (!after && !!before) { // Deletion
    return db.runTransaction(async tx => {
      await tx.delete(db.doc(`publicContracts/${before.id}`));
    });
  }

  const contract = after as ContractDocument;

  if (!contract) {
    const msg = 'Found invalid contract data.'
    console.error(msg);
    throw new Error(msg);
  }

  return await transformContractToPublic(contract);
}

export async function onContractVersionWrite(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
): Promise<any> {
  const { contractId, versionId } = context.params;

  if (!contractId) {
    const msg = 'Found invalid contractVersion data on deletion.'
    console.error(msg);
    throw new Error(msg);
  }

  const before = change.before.data();
  const after = change.after.data();

  const contractRef = db.doc(`contracts/${contractId}`);
  const contractSnap = await contractRef.get();
  const contract = contractSnap.data() as ContractDocument;

  if (!after && !!before) { // Deletion
    console.log(`deleting ContractVersion : "${versionId}" for : ${contractId}`);
    return await transformContractToPublic(contract, versionId);
  } else {
    return await transformContractToPublic(contract);
  }

}