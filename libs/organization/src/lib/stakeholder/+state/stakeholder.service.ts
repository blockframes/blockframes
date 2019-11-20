import { Injectable } from '@angular/core';
import { PublicOrganization, StakeholderState } from '@blockframes/organization';
import { snapshot } from '@blockframes/utils';
import { InvitationService } from '@blockframes/notification';
import { AuthQuery } from '@blockframes/auth';
import { StakeholderDocument, createStakeholder } from './stakeholder.firestore';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { StakeholderStore } from './stakeholder.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'deliveries/:deliveryId/stakeholders' })
export class StakeholderService extends CollectionService<StakeholderState> {
  constructor(
    private invitationService: InvitationService,
    private authQuery: AuthQuery,
    store: StakeholderStore
  ) {
    super(store)
  }

  /** Add a stakeholder into deliveries sub-collection */
  public async addStakeholder(
    docId: string,
    organizationId: string,
    isAccepted: boolean = false,
    tx?: firebase.firestore.Transaction
  ): Promise<string> {
    const organization = await snapshot<PublicOrganization>(`orgs/${organizationId}`);

    const stakeholder = createStakeholder({ id: organization.id, isAccepted });

    const stakeholderDoc = this.db.doc<StakeholderDocument>(
      `deliveries/${docId}/stakeholders/${stakeholder.id}`
    );

    !!tx ? tx.set(stakeholderDoc.ref, stakeholder) : stakeholderDoc.set(stakeholder);

    if (organization.id !== this.authQuery.orgId) {
      this.invitationService.sendDocumentInvitationToOrg(organization, docId);
    }

    return stakeholder.id;
  }

}
