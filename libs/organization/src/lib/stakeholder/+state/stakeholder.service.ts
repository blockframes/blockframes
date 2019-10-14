import { Injectable } from '@angular/core';
import { Stakeholder, createDeliveryStakeholder } from './stakeholder.model';
import { Organization, PublicOrganization } from '@blockframes/organization';
import { FireQuery } from '@blockframes/utils';
import { InvitationService } from '@blockframes/notification';
import { AuthQuery } from '@blockframes/auth';

@Injectable({ providedIn: 'root' })
export class StakeholderService {
  constructor(
    private db: FireQuery,
    private invitationService: InvitationService,
    private authQuery: AuthQuery
  ) {}

  /** Add a stakeholder into deliveries sub-collection */
  public async addStakeholder(
    docId: string,
    organizationId: string,
    isAccepted: boolean = false,
    tx?: firebase.firestore.Transaction
  ): Promise<string> {
    const organization = await this.db.snapshot<PublicOrganization>(`orgs/${organizationId}`);

    const stakeholder = createDeliveryStakeholder({
      id: organization.id,
      isAccepted
    });

    const stakeholderDoc = this.db.doc<Stakeholder>(
      `deliveries/${docId}/stakeholders/${stakeholder.id}`
    );

    !!tx ? tx.set(stakeholderDoc.ref, stakeholder) : stakeholderDoc.set(stakeholder);

    if (organization.id !== this.authQuery.orgId) {
      this.invitationService.sendDocumentInvitationToOrg(organization, docId);
    }

    return stakeholder.id;
  }

  public update(movieId: string, stakeholder: Partial<Stakeholder>) {
    // TODO: use FireQuery:
    this.db
      .doc<Stakeholder>(`movies/${movieId}/stakeholders/${stakeholder.id}`)
      .update(stakeholder);
  }

  public async remove(movieId: string, stakeholderId: string) {
    // TODO: use FireQuery:
    const stkPath = `movies/${movieId}/stakeholders/${stakeholderId}`;
    const stkDoc = this.db.doc(stkPath);

    return this.db.firestore.runTransaction(async tx => {
      // Delete the stakeholder:
      const stk = await tx.get(stkDoc.ref);
      const { id } = stk.data() as Stakeholder;

      // Remove the movie from the organization's movie list:
      // BEWARE: we'll have to check whether the organization is still a stakeholder
      //         when we'll allow an organization to have multiple stakeholder roles.
      const organizationPath = `orgs/${id}`;
      const organizationDoc = this.db.doc(organizationPath);
      const organization = await tx.get(organizationDoc.ref);
      const { movieIds } = organization.data() as Organization;

      const newMovieIds = movieIds.filter(x => x !== movieId);

      return Promise.all([
        tx.delete(stkDoc.ref),
        tx.update(organizationDoc.ref, { movieIds: newMovieIds })
      ]);
    });
  }
}
