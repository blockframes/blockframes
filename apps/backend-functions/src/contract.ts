import { functions, db } from './internals/firebase';
import { ContractDocument, PublicContractDocument, ContractVersionDocument } from './data/types';
/**
 * 
 * @param contract 
 * @param versionToSkip Used only when a version is removed from DB. We update public data with previous version.
 */
async function transformContractToPublic(contract: ContractDocument, versionToSkip?: string): Promise<void> {
  return db.runTransaction(async tx => {
    const publicContractSnap = await tx.get(db.doc(`publicContracts/${contract.id}`));

    const versionSnap = await tx.get(db.doc(`contracts/${contract.id}/versions/_meta`));
    const versionDoc = versionSnap.data();
    let lastVersionDoc;
    if (!!versionDoc) {
      const versionToFetch = !versionToSkip || versionToSkip !== versionDoc.count ? versionDoc.count : parseInt(versionDoc.count, 10) - 1;
      const lastVersionSnap = await tx.get(db.doc(`contracts/${contract.id}/versions/${versionToFetch}`));
      lastVersionDoc = lastVersionSnap.data();
    }

    /** @dev public contract document is created only it status is OK */
    if (lastVersionDoc && ['waitingpayment', 'paid', 'accepted'].includes(lastVersionDoc.status)) {
      const publicContract: PublicContractDocument = {
        id: contract.id,
        type: contract.type,
        titleIds: contract.titleIds,
        scope: lastVersionDoc ? lastVersionDoc.scope : {},
      };
      await tx.set(publicContractSnap.ref, publicContract)
    } else {
      /** @dev status is not OK, we delete public contract */
      tx.delete(db.doc(`publicContracts/${contract.id}`));
    }
  });
}

export async function onContractCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
): Promise<any> {
  const contract = snap.data() as ContractDocument;

  if (!contract) {
    const msg = 'Found invalid contract data on creation.'
    console.error(msg);
    throw new Error(msg);
  }

  return await transformContractToPublic(contract);
}

export async function onContractVersionCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
): Promise<any> {
  const contractId = snap.ref.parent.parent ? snap.ref.parent.parent.id : undefined;

  if (!contractId) {
    const msg = 'Found invalid contractVersion data on creation.'
    console.error(msg);
    throw new Error(msg);
  }

  const contractRef = db.doc(`contracts/${contractId}`);
  const contractSnap = await contractRef.get();
  const contract = contractSnap.data() as ContractDocument;
  return await transformContractToPublic(contract);
}

export async function onContractDelete(
  snap: FirebaseFirestore.DocumentSnapshot
): Promise<any> {
  const contract = snap.data() as ContractDocument;

  if (!contract) {
    const msg = 'Found invalid contract data on deletion.'
    console.error(msg);
    throw new Error(msg);
  }

  return db.runTransaction(async tx => {
    await tx.delete(db.doc(`publicContracts/${contract.id}`));
  });
}

export async function onContractVersionDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
): Promise<any> {
  const contractId = snap.ref.parent.parent ? snap.ref.parent.parent.id : undefined;
  // We retreive the version ID beeing currently removed
  const { id } = snap.data() as ContractVersionDocument;

  if (!contractId) {
    const msg = 'Found invalid contractVersion data on deletion.'
    console.error(msg);
    throw new Error(msg);
  }

  const contractRef = db.doc(`contracts/${contractId}`);
  const contractSnap = await contractRef.get();
  const contract = contractSnap.data() as ContractDocument;
  return await transformContractToPublic(contract, id);
}

export async function onContractUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
): Promise<any> {
  const contract = change.after.data() as ContractDocument;

  if (!contract) {
    const msg = 'Found invalid contract data when updating.'
    console.error(msg);
    throw new Error(msg);
  }

  return await transformContractToPublic(contract);
}

export async function onContractVersionUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
): Promise<any> {
  const contractId = change.before.ref.parent.parent ? change.before.ref.parent.parent.id : undefined;
  if (!contractId) {
    const msg = 'Found invalid contractVersion data when updating.'
    console.error(msg);
    throw new Error(msg);
  }

  const contractRef = db.doc(`contracts/${contractId}`);
  const contractSnap = await contractRef.get();
  const contract = contractSnap.data() as ContractDocument;
  return await transformContractToPublic(contract);
}