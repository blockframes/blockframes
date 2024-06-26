import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@firebase/firestore';
import { Block, createBlock } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class BlockService extends BlockframesSubCollection<Block> {
  readonly path = 'waterfall/:waterfallId/blocks';

  protected override fromFirestore(snapshot: DocumentSnapshot<Block>) {
    if (!snapshot.exists()) return undefined;
    const block = super.fromFirestore(snapshot);
    return createBlock(block);
  }

  public async history(waterfallId: string, ids: string[], fromId?: string) {
    const blocks = await this.getValue(ids, { waterfallId });
    return fromId ? blocks.slice(0, ids.indexOf(fromId) + 1) : blocks;
  }

}
