import { functions, db } from './internals/firebase';
import { ContractVersionDocument, VersionMeta } from './data/types';

/** Function triggered when a document is added into versions collection. */
export async function onContractVersionCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  return onContractVersionEvent(snap, context);
}

/** Function triggered when a document is removed from versions subcollection. */
export async function onContractVersionDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  return onContractVersionEvent(snap, context);
}

export async function onContractVersionEvent(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const contractVersion = snap.data() as ContractVersionDocument;

  if (!contractVersion) {
    console.error('Invalid contract version data :', contractVersion);
    throw new Error('Contract version create function got invalid data');
  }

  return db.runTransaction(async tx => {
    const _metaSnap = await tx.get(db.doc(`contracts/${context.params.contractID}/versions/_meta`));
    const _meta = _metaSnap.data() as VersionMeta;

    const newCount =
      context.eventType === 'google.firestore.document.create'
        ? _meta.count++
        : _meta.count--;

    return tx.update(_metaSnap.ref, { count: newCount });
  });
}
