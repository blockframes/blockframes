import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { createOrganization, Organization, OrgMember, ROLES } from './organization.model';
import { OrganizationStore } from './organization.store';
import { FireQuery } from '@blockframes/utils';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(
    private store: OrganizationStore,
    private db: FireQuery
  ) {}

  public async addMember(orgId: string, member: OrgMember): Promise<string> {
    const orgDoc = this.db.doc(`orgs/${orgId}`);
    const orgRightsDoc = this.db.doc(`users/${member.id}/orgRights/${orgId}`)

    this.db.firestore.runTransaction(async (tx) => {
      // Update the org
      const org = await tx.get(orgDoc.ref);
      const { userIds } = org.data();
      const nextUserIds = [...userIds, member.id];
      const orgTransaction = tx.update(orgDoc.ref, { userIds: nextUserIds });

      // update the user
      const userOrgRightTransaction = tx.set(orgRightsDoc.ref, { orgId, rightNameSlug: member.roles });

      return Promise.all([orgTransaction, userOrgRightTransaction]);
    }).then(() => {
      console.log('Transaction successfully committed!');
    }).catch((error) => {
      console.log('Transaction failed: ', error);
    });

    return member.id;
  }

  public async add(org: Organization, userId: string): Promise<string> {
    const orgId: string = this.db.createId();
    const newOrg: Organization = createOrganization({ ...org, id: orgId, userIds: [userId] });

    const orgDoc = this.db.doc(`orgs/${orgId}`);
    const orgRightsDoc = this.db.doc(`users/${userId}/orgRights/${orgId}`);

    this.db.firestore.runTransaction((transaction) => {
      return Promise.all([
        transaction.set(orgDoc.ref, newOrg),
        // @todo admin slug comes from json
        transaction.set(orgRightsDoc.ref, { orgId, rightNameSlug: [ROLES.ADMIN] })
      ]);
    }).catch((error) => {
      console.log('Transaction failed: ', error);
    });

    return orgId;
  }

  public update(id, org: Partial<Organization>) {
    this.store.update(id, org);
  }

  public remove(id: ID | ID[]) {
    this.store.remove(id);
  }
}
