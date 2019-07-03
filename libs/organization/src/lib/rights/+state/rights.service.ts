import { Injectable } from '@angular/core';
import { BFDoc, FireQuery } from '@blockframes/utils';
import { initializeOrgDocRights, initializeUserDocRights } from './rights.model';

@Injectable({
  providedIn: 'root'
})
export class RightsService {
  constructor(private db: FireQuery) {}

  //////////////////////
  // DOC TRANSACTIONS //
  //////////////////////

  /** Create a transaction for the document and add document rights (organization document rights and shared document rights) at the same time */
  public async createDocAndRights<T>(
    document: BFDoc, // TODO: Go a bit further into type checking (e.g. BFDoc<T>)
    orgId: string
  ) {
    const promises = [];
    const orgDocRights = initializeOrgDocRights(document.id, orgId);
    const userDocRights = initializeUserDocRights(document.id);

    return this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const orgDocRightsRef = this.db.doc<T>(`rights/${orgId}/orgDocsRights/${document.id}`).ref;
      promises.push(tx.set(orgDocRightsRef, orgDocRights));

      const userDocRightsRef = this.db.doc<T>(`rights/${orgId}/userDocsRights/${document.id}`).ref;
      promises.push(tx.set(userDocRightsRef, userDocRights));

      const documentRef = this.db.doc<T>(`${document._type}/${document.id}`).ref;
      promises.push(tx.set(documentRef, document));

      return Promise.all(promises);
    });
  }
}
