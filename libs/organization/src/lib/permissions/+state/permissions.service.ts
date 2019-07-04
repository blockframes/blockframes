import { Injectable } from '@angular/core';
import { BFDoc, FireQuery } from '@blockframes/utils';
import { createOrgDocPermissions, createUserDocPermissions } from './permissions.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  constructor(private db: FireQuery) {}

  //////////////////////
  // DOC TRANSACTIONS //
  //////////////////////

  /** Create a transaction for the document and add document permissions (organization document permissions and shared document permissions) at the same time */
  public async createDocAndPermissions<T>(
    document: BFDoc, // TODO: Go a bit further into type checking (e.g. BFDoc<T>)
    orgId: string
  ) {
    const promises = [];
    const orgDocPermissions = createOrgDocPermissions(document.id, orgId);
    const userDocPermissions = createUserDocPermissions(document.id);

    return this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const orgDocPermissionsRef = this.db.doc<T>(`permissions/${orgId}/orgDocsPermissions/${document.id}`).ref;
      promises.push(tx.set(orgDocPermissionsRef, orgDocPermissions));

      const userDocPermissionsRef = this.db.doc<T>(`permissions/${orgId}/userDocsPermissions/${document.id}`).ref;
      promises.push(tx.set(userDocPermissionsRef, userDocPermissions));

      const documentRef = this.db.doc<T>(`${document._type}/${document.id}`).ref;
      promises.push(tx.set(documentRef, document));

      return Promise.all(promises);
    });
  }
}
