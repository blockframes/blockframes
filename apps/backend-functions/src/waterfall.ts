import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import * as admin from 'firebase-admin';
import { Block, Waterfall, WaterfallDocument } from '@blockframes/model';
import { waterfall } from '@blockframes/waterfall/main';
import { getDocumentSnap, toDate } from '@blockframes/firebase-utils/firebase-utils';
import { BlockframesChange } from '@blockframes/firebase-utils';
import { difference } from 'lodash';

export async function buildWaterfall(data: { waterfallId: string, versionId: string, scope?: string[] }, context: CallableContext) {
  if (!data.waterfallId) throw new Error('Missing waterfallId in request');

  const db = admin.firestore();

  const waterfallSnap = await db.collection('waterfall').doc(data.waterfallId).get();
  if (!waterfallSnap.exists) throw new Error(`Invalid waterfallId ${data.waterfallId}`);
  const waterfallDoc = toDate<Waterfall>(waterfallSnap.data()!);

  const blocksSnap = await db.collection('waterfall').doc(data.waterfallId).collection('blocks').get();
  const blocks = blocksSnap.docs.map(d => toDate<Block>(d.data()));

  const version = waterfallDoc.versions.find(v => v.id === data.versionId);
  if (!version) throw new Error(`Invalid versionId ${data.versionId}`);

  const versionBlocks = version.blockIds.map(blockId => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) throw new Error(`${blockId} not found`);
    return block;
  });

  const actions = versionBlocks.map(block => Object.values(block.actions));

  return JSON.stringify({ waterfall: waterfall(data.waterfallId, actions, data.scope), version });
}

export async function onWaterfallUpdate(change: BlockframesChange<Waterfall>) {
  const before = change.before.data();
  const after = change.after.data();

  if (!before || !after) {
    console.error('Invalid waterfall data, before:', before, 'after:', after);
    throw new Error('waterfall update function got invalid org data');
  }

  // TODO #9389
  // cleanWaterfallMedias(before, after);

  // If org is removed from waterfall document, we also remove permissions
  if (before.orgIds.length > after.orgIds.length) {
    const orgRemovedId = difference(before.orgIds, after.orgIds)[0];
    const permission = await getDocumentSnap(`waterfall/${after.id}/permissions/${orgRemovedId}`);
    return permission.ref.delete()
  }
}

export async function onWaterfallDocumentDelete(change: BlockframesChange<WaterfallDocument>) {
  const before = change.before.data();

  const waterfallSnap = await getDocumentSnap(`waterfall/${before.waterfallId}`);
  const waterfall = waterfallSnap.data() as Waterfall;

  const documents = waterfall.documents.filter(d => d.id !== before.id);


  // TODO #9420 delete terms & incomes if type === 'contract' (check "onContractDelete()")

  // This will trigger onWaterfallUpdate => cleanWaterfallMedias
  return waterfallSnap.ref.update({ documents });
}


export const removeWaterfallFile = async (data: any, context: CallableContext) => {
  //  TODO #9389 check caller's org with context.uid  and check ownerId === org.id;
  // remove waterfall.document.find(d => d.id === documentId);
  return;
};