
import { Injectable } from '@angular/core';
import { FireSubCollection } from 'ngfire';
import { DocumentSnapshot } from '@firebase/firestore';

import { WaterfallPermissions, createWaterfallPermissions } from '@blockframes/model';


@Injectable({ providedIn: 'root' })
export class WaterfallPermissionsService extends FireSubCollection<WaterfallPermissions> {

  override memorize = true;

  override storeId = true;

  readonly path = 'waterfall/:waterfallId/permissions';

  protected override fromFirestore(snapshot: DocumentSnapshot<WaterfallPermissions>) {
    if (!snapshot.exists()) return undefined;
    const permissions = super.fromFirestore(snapshot);
    return createWaterfallPermissions(permissions);
  }

  public async create(waterfallId: string, permissions: Partial<WaterfallPermissions>) {
    const perm = createWaterfallPermissions(permissions);
    return this.add(perm, { params: { waterfallId } });
  }
}
