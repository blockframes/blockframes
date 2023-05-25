import { Injectable } from '@angular/core';
import { FireSubCollection } from 'ngfire';
import { DocumentSnapshot } from '@firebase/firestore';

import { RightholderRole, WaterfallPermissions, createDocumentMeta, createWaterfallPermissions } from '@blockframes/model';
import { AuthService } from '@blockframes/auth/service';

@Injectable({ providedIn: 'root' })
export class WaterfallPermissionsService extends FireSubCollection<WaterfallPermissions> {

  override memorize = true;

  override storeId = true;

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

  public create(waterfallId: string, permissions: Partial<WaterfallPermissions>) {
    const createdBy = this.authService.uid;
    const perm = createWaterfallPermissions({
      _meta: createDocumentMeta({ createdBy }),
      ...permissions
    });
    return this.add(perm, { params: { waterfallId } });
  }

  public async hasRole(waterfallId: string, orgId: string, role: RightholderRole) {
    const permissions = await this.getValue(orgId, { waterfallId });
    return permissions.roles.includes(role);
  }
}