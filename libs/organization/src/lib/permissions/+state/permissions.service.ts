import { Injectable } from '@angular/core';
import { BFDoc, FireQuery } from '@blockframes/utils';
import { createOrgDocPermissions, createUserDocPermissions, Permissions } from './permissions.model';
import { PermissionsQuery } from './permissions.query';
import { Stakeholder, createMovieStakeholder } from '@blockframes/movie';
import { Organization } from '../../+state';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  constructor(private db: FireQuery, private query: PermissionsQuery) {}

  //////////////////////
  // DOC TRANSACTIONS //
  //////////////////////

  /** Create a transaction for the document and add document permissions (organization document permissions and shared document permissions) at the same time */
  public async createDocAndPermissions<T>(
    document: BFDoc, // TODO: Go a bit further into type checking (e.g. BFDoc<T>)
    org: Organization
  ) {
    const promises = [];
    const orgDocPermissions = createOrgDocPermissions(document.id, org.id);
    const userDocPermissions = createUserDocPermissions(document.id);

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const orgDocPermissionsRef = this.db.doc<T>(`permissions/${org.id}/orgDocsPermissions/${document.id}`).ref;
      promises.push(tx.set(orgDocPermissionsRef, orgDocPermissions));

      const userDocPermissionsRef = this.db.doc<T>(`permissions/${org.id}/userDocsPermissions/${document.id}`).ref;
      promises.push(tx.set(userDocPermissionsRef, userDocPermissions));

      const documentRef = this.db.doc<T>(`${document._type}/${document.id}`).ref;
      promises.push(tx.set(documentRef, document));

      return Promise.all(promises);
    });
  }

  /** Switch a user from admins array to superAdmins (and vice versa) to grant him SuperAdmin privileges */
  public switchRoles(userId: string) {
    const orgPermissions = this.query.getValue();
    const orgPermissionsDoc = this.db.doc<Permissions>(`permissions/${orgPermissions.orgId}`);
    const batch = this.db.firestore.batch();

    // Delete userId from admins / superAdmins array to keep the document clean
    if (orgPermissions.admins.includes(userId)) {
      const admins = orgPermissions.admins.filter(adminId => adminId !== userId);
      batch.update(orgPermissionsDoc.ref, {admins});
      const superAdmins = [...orgPermissions.superAdmins, userId];
      batch.update(orgPermissionsDoc.ref, {superAdmins});
    }

    if (orgPermissions.superAdmins.includes(userId)) {
      const superAdmins = orgPermissions.superAdmins.filter(superAdminId => superAdminId !== userId);
      batch.update(orgPermissionsDoc.ref, {superAdmins});
      const admins = [...orgPermissions.admins, userId];
      batch.update(orgPermissionsDoc.ref, {admins});
    }

    return batch.commit();
  }
}
