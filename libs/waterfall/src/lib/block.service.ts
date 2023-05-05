import { Injectable } from '@angular/core';
import { FireSubCollection } from 'ngfire';
import { DocumentSnapshot } from '@firebase/firestore';
import { Block, createBlock, createAction, Action } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
export class BlockService extends FireSubCollection<Block> {

  override memorize = true;

  override storeId = true;

  readonly path = 'waterfall/:waterfallId/blocks';

  protected override fromFirestore(snapshot: DocumentSnapshot<Block>) {
    if (!snapshot.exists()) return undefined;
    const block = super.fromFirestore(snapshot);
    return createBlock(block);
  }

  public async create(waterfallId: string, name: string, actions: Partial<Action>[]) {
    const block = createBlock({ name });
    let index = 0;
    for (const action of actions) {
      block.actions[index] = createAction({ ...action, actionId: index.toString() });
      index++;
    }

    return this.add(block, { params: { waterfallId } });
  }

  public async history(waterfallId: string, ids: string[], fromId?: string) {
    const blocks = await this.getValue(ids, { waterfallId });
    return fromId ? blocks.slice(0, ids.indexOf(fromId) + 1) : blocks;
  }

}
