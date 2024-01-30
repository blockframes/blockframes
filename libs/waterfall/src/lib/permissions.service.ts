import { Injectable } from '@angular/core';
import type firestore from 'firebase/firestore';
import { DocumentSnapshot } from '@firebase/firestore';
import { WaterfallPermissions, createDocumentMeta, createWaterfallPermissions } from '@blockframes/model';
import { AuthService } from '@blockframes/auth/service';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { AtomicWrite } from 'ngfire';
import { doc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class WaterfallPermissionsService extends BlockframesSubCollection<WaterfallPermissions> {
  readonly path = 'waterfall/:waterfallId/permissions';

  constructor(
    private authService: AuthService,
  ) {
    super();
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<WaterfallPermissions>) {
    if (!snapshot.exists()) return undefined;
    const permissions = super.fromFirestore(snapshot);
    return createWaterfallPermissions(permissions);
  }

  public create(waterfallId: string, write: AtomicWrite, id: string, isAdmin: boolean = false, rightholderIds?: string[]) {
    const createdBy = this.authService.uid;
    const perm = createWaterfallPermissions({
      _meta: createDocumentMeta({ createdBy }),
      id,
      isAdmin,
      rightholderIds,
    });
    const permRef = doc(this.db, `waterfall/${waterfallId}/permissions/${perm.id}`);
    (write as firestore.WriteBatch).set(permRef, perm);
  }

}