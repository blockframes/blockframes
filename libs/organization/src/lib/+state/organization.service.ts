import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { createOrganization, Organization, OrgMember } from './organization.model';
import { OrganizationStore } from './organization.store';
import { FireQuery } from '@blockframes/utils';
import * as INITIALRIGHTS from './../org-initial-rights.json';
import { OrganizationQuery } from './organization.query';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(
    private store: OrganizationStore,
    private query: OrganizationQuery,
    private db: FireQuery
  ) {}

  public async addMember(orgId: string, member: OrgMember): Promise<string> {
    const orgDoc = this.db.doc(`orgs/${orgId}`);
    const userDoc = this.db.doc(`users/${member.id}`);

    this.db.firestore
      .runTransaction(async tx => {
        // Update the org
        const org = await tx.get(orgDoc.ref);
        const { userIds } = org.data();
        const nextUserIds = [...userIds, member.id];
        const orgTransaction = tx.update(orgDoc.ref, { userIds: nextUserIds });

        // update the user
        const updateUserTransaction = tx.update(userDoc.ref, { orgId })

        return Promise.all([orgTransaction, updateUserTransaction]);
      })
      .then(() => {
        console.log('Transaction successfully committed!');
      })
      .catch(error => {
        console.log('Transaction failed: ', error);
      });

    return member.id;
  }

  public async add(org: Organization, userId: string): Promise<string> {
    const orgId: string = this.db.createId();
    const newOrg: Organization = createOrganization({ ...org, id: orgId, userIds: [userId] });

    const orgDoc = this.db.doc(`orgs/${orgId}`);
    const orgRightsDoc = this.db.doc(`rights/${orgId}`);
    const userDoc = this.db.doc(`users/${userId}`);

    this.db.firestore
      .runTransaction(transaction => {
        return Promise.all([
          transaction.set(orgDoc.ref, newOrg),
          // @todo admin slug comes from json
          transaction.set(orgRightsDoc.ref, { orgId, superAdmin: userId, ...INITIALRIGHTS.orgPermissions }),
          INITIALRIGHTS.roles.forEach(role => {
            const roleId = this.db.createId();
            const orgRole = this.db.doc(`rights/${orgId}/roles/${roleId}`);
            transaction.set(orgRole.ref, {id: roleId, ...role});
          }),
          INITIALRIGHTS.appsPermissions.forEach(app => {
            const orgApp = this.db.doc(`rights/${orgId}/apps/${app.name}`);
            transaction.set(orgApp.ref, app);
          }),
          transaction.update(userDoc.ref, { orgId })
        ]);
      })
      .catch(error => {
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

  public getOrgRoles() {
    return this.query
      .selectActiveId()
      .pipe(switchMap(id => this.db.collection(`rights/${id}/roles`).valueChanges()));
  }
}
