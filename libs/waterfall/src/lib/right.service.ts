import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@firebase/firestore';
import { Right, createRight } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class RightService extends BlockframesSubCollection<Right> {
  readonly path = 'waterfall/:waterfallId/rights';

  protected override fromFirestore(snapshot: DocumentSnapshot<Right>) {
    if (!snapshot.exists()) return undefined;
    const block = super.fromFirestore(snapshot);
    return createRight(block);
  }

}
