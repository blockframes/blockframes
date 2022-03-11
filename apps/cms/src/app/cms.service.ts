import { Injectable } from '@angular/core';
import { docData, updateDoc, collectionData, Firestore } from '@angular/fire/firestore';
import { doc, DocumentReference, collection, CollectionReference } from 'firebase/firestore';
import { CmsTemplate, CmsApp } from '@blockframes/admin/cms';
export interface CmsParams {
  app?: string;
  page?: string;
  template?: string;
}

@Injectable({ providedIn: 'root' })
export class CmsService {

  constructor(private db: Firestore) { }

  private getPath({ app, page, template }: CmsParams) {
    return ['cms', app, page, template].filter(v => !!v).join('/');
  }

  save(document: CmsTemplate | CmsApp, params: CmsParams) {
    const path = this.getPath(params);
    const ref = doc(this.db, path) as DocumentReference<CmsTemplate | CmsApp>;
    return updateDoc<CmsTemplate | CmsApp>(ref, document);
  }

  collection<T extends CmsTemplate | CmsApp>(params: CmsParams) {
    const path = this.getPath(params);
    const ref = collection(this.db, path) as CollectionReference<T>;
    return collectionData<T>(ref);
  }

  doc<T extends CmsTemplate | CmsApp>(params: CmsParams) {
    const path = this.getPath(params);
    const ref = doc(this.db, path) as DocumentReference<T>;
    return docData<T>(ref);
  }
}