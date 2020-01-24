import { Injectable } from '@angular/core';
import { PermissionsQuery } from './permissions.query';
import { OrganizationMember } from '../../member/+state/member.model';
import { UserRole, createDocPermissions } from './permissions.firestore';
import { PermissionsState, PermissionsStore } from './permissions.store';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { firestore } from 'firebase/app';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { Movie } from '@blockframes/movie/movie+state/movie.model';
import { Delivery } from '@blockframes/material';

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'permissions' })
export class PermissionsService extends CollectionService<PermissionsState> {
  constructor(
    private query: PermissionsQuery,
    private organizationQuery: OrganizationQuery,
    store: PermissionsStore
  ) {
    super(store);
  }

  /** Update roles of members of the organization */
  public async updateMembersRole(organizationMembers: Partial<OrganizationMember>[]) {
    const orgId = this.query.getActiveId();
    const permissions = await this.getValue(orgId);

    organizationMembers.forEach(({ uid, role }) => {
      switch (role) {
        case UserRole.superAdmin:
          delete permissions.roles[uid];
          permissions.roles[uid] = UserRole.superAdmin;
          break;
        case UserRole.admin:
          delete permissions.roles[uid];
          permissions.roles[uid] = UserRole.admin;
          break;
        case UserRole.member:
          delete permissions.roles[uid];
          permissions.roles[uid] = UserRole.member;
          break;
        default:
          throw new Error(`User with id : ${uid} have no role.`);
      }
    });

    return this.update(orgId, { roles: permissions.roles });
  }

  /**
   * Takes a document (movie or delivery), create relative permissions
   * and add them to documentPermissions subcollection.
   * @param doc
   * @param write
   */
  public addDocumentPermissions(doc: Movie | Delivery | Contract, write: firestore.WriteBatch) {
    const organizationId = this.organizationQuery.getActiveId();
    const documentPermissions = createDocPermissions({ id: doc.id, ownerId: organizationId });
    const documentPermissionsRef = this.db.doc(`permissions/${organizationId}/documentPermissions/${documentPermissions.id}`).ref;
    write.set(documentPermissionsRef, documentPermissions);
  }

  /**
   * Takes a contract, create relative permissions for each party of
   * the contract, then add them to documentPermissions subcollection.
   * @param contract
   * @param write
   */
  public addContractPermissions(contract: Contract) {
    this.db.firestore.runTransaction(async tx => {
      contract.partyIds.forEach(partyId => {
        const contractPermissions = createDocPermissions({ id: contract.id });
        const contractPermissionsRef = this.db.doc(`permissions/${partyId}/documentPermissions/${contractPermissions.id}`).ref;
        tx.set(contractPermissionsRef, contractPermissions)
      })
    })
  }
}
