import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import {
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
import { getDocument, getCollection, getDocumentSnap } from '@blockframes/firebase-utils/firebase-utils';
import { BlockframesChange, BlockframesSnapshot, removeAllSubcollections } from '@blockframes/firebase-utils';
import { difference } from 'lodash';
import { cleanRelatedContractDocuments } from './contracts';
import { db } from './internals/firebase';
import { EventContext } from 'firebase-functions';
import { cleanWaterfallMedias } from './media';

export async function onWaterfallUpdate(change: BlockframesChange<Waterfall>) {
  const before = change.before.data();
  const after = change.after.data();

  if (!before || !after) {
    console.error('Invalid waterfall data, before:', before, 'after:', after);
    throw new Error('waterfall update function got invalid data');
  }

  cleanWaterfallMedias(before, after);

  const promises = [];

  // If org is removed from waterfall document, we also remove permissions
  if (before.orgIds.length > after.orgIds.length) {
    const orgRemovedIds = difference(before.orgIds, after.orgIds);
    for (const orgRemovedId of orgRemovedIds) {
      promises.push(getDocumentSnap(`waterfall/${after.id}/permissions/${orgRemovedId}`).then(p => p.ref.delete()));
    }
  }

  // If rightholder is removed from waterfall document, we also update permissions
  if (before.rightholders.length > after.rightholders.length) {
    const rightholderRemovedIds = difference(before.rightholders.map(r => r.id), after.rightholders.map(r => r.id));
    const _permissions = await getCollection<WaterfallPermissions>(`waterfall/${after.id}/permissions`);
    const permissions = after.orgIds.map(o => _permissions.find(p => p.id === o));
    for (const permission of permissions) {
      if (permission.rightholderIds.some(id => rightholderRemovedIds.includes(id))) {
        permission.rightholderIds = permission.rightholderIds.filter(id => !rightholderRemovedIds.includes(id));
        promises.push(getDocumentSnap(`waterfall/${after.id}/permissions/${permission.id}`).then(p => p.ref.update(permission)));
      }
    }
  }


  // Deletes removed blocks from versions
  const blocksBefore = before.versions ? Array.from(new Set(before.versions.map(v => v.blockIds).flat())) : [];
  const blocksAfter = after.versions ? Array.from(new Set(after.versions.map(v => v.blockIds).flat())) : [];
  const removedBlocks = blocksBefore.filter(b => !blocksAfter.includes(b));
  for (const blockId of removedBlocks) {
    promises.push(getDocumentSnap(`waterfall/${after.id}/blocks/${blockId}`).then(b => b.ref.delete()));
  }
  return Promise.all(promises);
}

export async function onWaterfallDelete(snap: BlockframesSnapshot<Waterfall>, context: EventContext) {
  const { waterfallID } = context.params;
  const batch = db.batch();

  // Delete sub-collections
  await removeAllSubcollections(snap, batch);

  const waterfall = snap.data();
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

export async function onWaterfallStatementUpdate(change: BlockframesChange<Statement>) {
  const before = change.before.data();
  const after = change.after.data();

  if (!before || !after) {
    console.error('Invalid statement data, before:', before, 'after:', after);
    throw new Error('Statement update function got invalid data');
  }

  const batch = db.batch();

  if (isDistributorStatement(after) || isDirectSalesStatement(after)) {
    // If incomeId is removed from distributor or direct sales statement document, we also remove income document
    const incomeRemovedIds = difference(before.incomeIds, after.incomeIds);
    const incomes = await Promise.all(incomeRemovedIds.map(id => getDocumentSnap(`incomes/${id}`, db)));
    incomes.forEach(doc => batch.delete(doc.ref));

    // Same for expenses
    const expenseRemovedIds = difference(before.expenseIds, after.expenseIds);
    const expenses = await Promise.all(expenseRemovedIds.map(id => getDocumentSnap(`expenses/${id}`, db)));
    expenses.forEach(doc => batch.delete(doc.ref));
  }

  return batch.commit();
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