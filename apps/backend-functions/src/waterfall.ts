import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import * as admin from 'firebase-admin';
import { Block, Waterfall } from '@blockframes/waterfall/waterfall';
import { waterfall } from '@blockframes/waterfall/main';
import { toDate } from '@blockframes/firebase-utils/firebase-utils';

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