import { Injectable } from '@angular/core';
import { BFDoc, FireQuery } from '@blockframes/utils';
import { createOrgDocPermissions, createUserDocPermissions, Permissions } from './permissions.model';
import { PermissionsQuery } from './permissions.query';
import { Organization } from '../../+state';
import { OrganizationMember, UserRole } from '../../member/+state';

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
    document: BFDoc,
    organization: Organization,
    tx: firebase.firestore.Transaction
  ) {
    const promises = [];
    const orgDocPermissions = createOrgDocPermissions(document.id, organization.id);
    const userDocPermissions = createUserDocPermissions(document.id);

    const orgDocPermissionsRef = this.db.doc<T>(`permissions/${organization.id}/orgDocsPermissions/${document.id}`).ref;
    promises.push(tx.set(orgDocPermissionsRef, orgDocPermissions));

    const userDocPermissionsRef = this.db.doc<T>(`permissions/${organization.id}/userDocsPermissions/${document.id}`).ref;
    promises.push(tx.set(userDocPermissionsRef, userDocPermissions));

    const documentRef = this.db.doc<T>(`${document._type}/${document.id}`).ref;
    promises.push(tx.set(documentRef, document));

    return Promise.all(promises);
  }

  /** Update roles of members of the organization */
  public async updateMembersRole(members: OrganizationMember[]) {
    const orgId = this.query.getValue().orgId;
    const orgPermissionsDocRef = this.db.doc<Permissions>(`permissions/${orgId}`).ref;

    return this.db.firestore.runTransaction(async tx => {
      const orgPermissionsDoc = await tx.get(orgPermissionsDocRef);
      let {superAdmins, admins} = orgPermissionsDoc.data() as Permissions;

      const isAdmin = (uid) => admins.includes(uid)
      const isSuperAdmin = (uid) => superAdmins.includes(uid)

      members.forEach(({uid, role}) => {
        // Case of role = 'admin': we remove the memberId of admins and insert it in superAdmins
        if (role === UserRole.admin) {
          if (isAdmin(uid) && !isSuperAdmin(uid)) {
            admins = admins.filter(admin => admin !== uid);
            superAdmins = [...superAdmins, uid];
          }
        }
        // Case of role = 'member': we remove the memberId of superAdmins and insert it in admins
        else {
          if (!isAdmin(uid) && isSuperAdmin(uid)) {
            superAdmins = superAdmins.filter(superAdmin => superAdmin !== uid);
            admins = [...admins, uid]
          };
        }
      });
      return tx.update(orgPermissionsDocRef, { admins, superAdmins });
    })
  }
}
