import { Injectable } from '@angular/core';
import { Movie } from '@blockframes/movie';
import { Template, Delivery, Material } from '@blockframes/material';
import { FireQuery } from '../firequery/firequery';
import { initializeOwnDocRights, initializeSharedDocRights } from './types';

@Injectable({ providedIn: 'root' })
export class DocTransaction {

  constructor(private db: FireQuery) {}

  public async createTransaction<T>(document: Movie | Template | Delivery, orgId: string, templateId?: string) {
    const promises = [];
    const orgDocRights = initializeOwnDocRights(document.id);
    const sharedDocRights = initializeSharedDocRights(document.id)

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const orgDocRightsRef = this.db.doc<any>(`rights/${orgId}/docs/${document.id}`).ref;
      promises.push(tx.set(orgDocRightsRef, orgDocRights));

      const sharedDocRightsRef = this.db.doc<any>(`rights/${orgId}/apps/${document.collectionName}Rights/docRights/${document.id}`).ref;
      promises.push(tx.set(sharedDocRightsRef, sharedDocRights))

      const documentRef = this.db.doc<T>(`${document.collectionName}/${document.id}`).ref;
      promises.push(tx.set(documentRef, document));

      if (!!templateId) {
        const materials = await this.db.snapshot<Material[]>(`templates/${templateId}/materials`);
        materials.map(material => {
          const materialRef =  this.db.doc<Material>(`${document.collectionName}/${document.id}/materials/${material.id}`).ref;
          promises.push(tx.set(materialRef, material));
          }
        );
        return document.id;
      }
      return Promise.all(promises);
      }
    )
  }

}
