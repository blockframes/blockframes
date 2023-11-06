import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import * as admin from 'firebase-admin';
import {
  Block,
  PublicUser,
  Right,
  Statement,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  WaterfallPermissions,
  convertDocumentTo,
  isContract,
  isDirectSalesStatement,
  isDistributorStatement
} from '@blockframes/model';
import { waterfall } from '@blockframes/waterfall/main';
import { getDocument, getDocumentSnap, toDate } from '@blockframes/firebase-utils/firebase-utils';
import { BlockframesChange, BlockframesSnapshot, removeAllSubcollections } from '@blockframes/firebase-utils';
import { difference } from 'lodash';
import { cleanRelatedContractDocuments } from './contracts';
import { db } from './internals/firebase';
import { EventContext } from 'firebase-functions';
import { cleanWaterfallMedias } from './media';

export async function buildWaterfall(data: { waterfallId: string, versionId: string }) {
  if (!data.waterfallId) throw new Error('Missing waterfallId in request');

  const db = admin.firestore();

  const waterfallSnap = await db.collection('waterfall').doc(data.waterfallId).get();
  if (!waterfallSnap.exists) throw new Error(`Invalid waterfallId ${data.waterfallId}`);
  const waterfallDoc = toDate<Waterfall>(waterfallSnap.data());

  const blocksSnap = await db.collection('waterfall').doc(data.waterfallId).collection('blocks').get();
  const blocks = blocksSnap.docs.map(d => toDate<Block>(d.data()));

  const version = waterfallDoc.versions.find(v => v.id === data.versionId);
  if (!version) throw new Error(`Invalid versionId ${data.versionId}`);

  const versionBlocks = version.blockIds.map(blockId => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) throw new Error(`${blockId} not found`);
    return block;
  });

  return JSON.stringify({ waterfall: waterfall(data.waterfallId, versionBlocks), version });
}

export async function onWaterfallUpdate(change: BlockframesChange<Waterfall>) {
  const before = change.before.data();
  const after = change.after.data();

  if (!before || !after) {
    console.error('Invalid waterfall data, before:', before, 'after:', after);
    throw new Error('waterfall update function got invalid org data');
  }

  cleanWaterfallMedias(before, after);

  // If org is removed from waterfall document, we also remove permissions
  if (before.orgIds.length > after.orgIds.length) {
    const orgRemovedId = difference(before.orgIds, after.orgIds)[0];
    const permission = await getDocumentSnap(`waterfall/${after.id}/permissions/${orgRemovedId}`);
    return permission.ref.delete();
  }

  // Deletes removed blocks from versions
  const blocksBefore = before.versions ? Array.from(new Set(before.versions.map(v => v.blockIds).flat())) : [];
  const blocksAfter = after.versions ? Array.from(new Set(after.versions.map(v => v.blockIds).flat())) : [];
  const removedBlocks = blocksBefore.filter(b => !blocksAfter.includes(b));
  return Promise.all(removedBlocks.map(blockId => getDocumentSnap(`waterfall/${after.id}/blocks/${blockId}`).then(b => b.ref.delete())));
}

export async function onWaterfallDelete(snap: BlockframesSnapshot<Waterfall>, context: EventContext) {
  const { waterfallID } = context.params;
  const batch = db.batch();
  const waterfall = snap.data();

  // Delete sub-collections
  await removeAllSubcollections(snap, batch);

  cleanWaterfallMedias(waterfall);

  // Remove remaining standalone incomes and expenses (not linked to contracts)
  const [incomes, expenses] = await Promise.all([
    db.collection('incomes').where('titleId', '==', waterfallID).get(),
    db.collection('expenses').where('titleId', '==', waterfallID).get()
  ]);
  incomes.forEach(doc => batch.delete(doc.ref));
  expenses.forEach(doc => batch.delete(doc.ref));

  return batch.commit();
}

export async function onWaterfallDocumentDelete(docSnapshot: BlockframesSnapshot<WaterfallDocument>, context: EventContext) {
  const { waterfallID } = context.params;

  const waterfallDocument = docSnapshot.data();
  const waterfallSnap = await getDocumentSnap(`waterfall/${waterfallID}`);
  if (waterfallSnap.exists) {
    const waterfall = waterfallSnap.data() as Waterfall;
    const documents = waterfall.documents.filter(d => d.id !== waterfallDocument.id);
    // This will trigger onWaterfallUpdate => cleanWaterfallMedias
    waterfallSnap.ref.update({ documents });
  }

  // If document is a contract, clean income, terms etc..
  if (isContract(waterfallDocument)) await cleanRelatedContractDocuments(convertDocumentTo<WaterfallContract>(waterfallDocument), { filterByTitleId: true });

  // Check for amendments and remove them if any
  if (!waterfallDocument.rootId) {
    const amendments = await waterfallSnap.ref.collection('documents').where('rootId', '==', waterfallDocument.id).get();
    await Promise.all(amendments.docs.map(d => d.ref.delete()));
  }

  return true;
}

export async function onWaterfallStatementDelete(docSnapshot: BlockframesSnapshot<Statement>) {
  const statement = docSnapshot.data();

  const batch = db.batch();

  if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
    // Remove incomes and expenses 
    const incomes = await Promise.all(statement.incomeIds.map(id => getDocumentSnap(`incomes/${id}`, db)));
    incomes.forEach(doc => batch.delete(doc.ref));

    const expenses = await Promise.all(statement.expenseIds.map(id => getDocumentSnap(`expenses/${id}`, db)));
    expenses.forEach(doc => batch.delete(doc.ref));
  }

  return batch.commit();
}

export async function onWaterfallRightDelete(docSnapshot: BlockframesSnapshot<Right>, context: EventContext) {
  const { waterfallID } = context.params;

  const right = docSnapshot.data();

  const waterfallSnap = await getDocumentSnap(`waterfall/${waterfallID}`);

  // Remove childs if current right is a group
  const childs = await waterfallSnap.ref.collection('rights').where('groupId', '==', right.id).get();
  await Promise.all(childs.docs.map(d => d.ref.delete()));

  return true;
}

export const removeWaterfallFile = async (data: { waterfallId: string, documentId: string }, context: CallableContext) => {
  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  const user = await getDocument<PublicUser>(`users/${context.auth.uid}`);
  if (!user.orgId) throw new Error('Permission denied: missing org id.');
  const waterfallSnap = await getDocumentSnap(`waterfall/${data.waterfallId}`);
  if (!waterfallSnap.exists) throw new Error('Permission denied: waterfall not found.');
  const waterfall = waterfallSnap.data() as Waterfall;
  if (!waterfall.orgIds.includes(user.orgId)) throw new Error('Permission denied: user is not part of the waterfall.');
  const permission = await getDocument<WaterfallPermissions>(`waterfall/${data.waterfallId}/permissions/${user.orgId}`);
  const document = await getDocument<WaterfallDocument>(`waterfall/${data.waterfallId}/documents/${data.documentId}`);

  const canRemoveFile = permission.isAdmin || document.ownerId === user.orgId;
  if (!canRemoveFile) throw new Error('Permission denied: user is not waterfall admin or document owner.');

  const file = waterfall.documents.find(d => d.id === data.documentId);
  if (!file) throw new Error('File not found');
  const documents = waterfall.documents.filter(d => d.id !== data.documentId);
  // This will trigger onWaterfallUpdate => cleanWaterfallMedias
  return waterfallSnap.ref.update({ documents });
};