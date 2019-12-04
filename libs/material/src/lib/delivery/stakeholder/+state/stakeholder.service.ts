import { Injectable } from '@angular/core';
import { OrganizationService } from '@blockframes/organization';
import { InvitationService } from '@blockframes/notification';
import { AuthQuery } from '@blockframes/auth';
import { StakeholderDocument, createDeliveryStakeholder } from './stakeholder.firestore';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { StakeholderStore, StakeholderState } from './stakeholder.store';
import { DeliveryQuery } from '../../+state/delivery.query';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'deliveries/:deliveryId/stakeholders' })
export class StakeholderService extends CollectionService<StakeholderState> {
  constructor(
    private invitationService: InvitationService,
    private organizationService: OrganizationService,
    private deliveryQuery: DeliveryQuery,
    private authQuery: AuthQuery,
    store: StakeholderStore
  ) {
    super(store)
  }

  get path() {
    return `deliveries/${this.deliveryQuery.getActiveId()}/stakeholders`
  }

  /** Add a stakeholder into deliveries sub-collection */
  public async addStakeholder(
    docId: string,
    organizationId: string,
    isAccepted: boolean = false,
    tx?: firebase.firestore.Transaction
  ): Promise<string> {
    const organization = await this.organizationService.getValue(organizationId);
    const stakeholder = createDeliveryStakeholder({ orgId: organization.id, isAccepted });
    const stakeholderDoc = this.db.doc<StakeholderDocument>(
      `deliveries/${docId}/stakeholders/${stakeholder.orgId}`
    );

    !!tx ? tx.set(stakeholderDoc.ref, stakeholder) : this.add(stakeholder);

    if (organization.id !== this.authQuery.orgId) {
      this.invitationService.sendDocumentInvitationToOrg(organization, docId);
    }

    return stakeholder.orgId;
  }

}
