import { Injectable } from '@angular/core';
import {
  docData,
  updateDoc,
  collectionData,
  doc,
  DocumentReference,
  collection,
  CollectionReference
} from '@angular/fire/firestore';
import { CmsTemplate, CmsApp } from '@blockframes/admin/cms';
import { OrganizationService } from '@blockframes/organization/+state';
export interface CmsParams {
  app?: string;
  page?: string;
  template?: string;
}

@Injectable({ providedIn: 'root' })
export class CmsService {

  constructor(private firestore: OrganizationService) { } // TODO #8280

  private getPath({ app, page, template }: CmsParams) {
    return ['cms', app, page, template].filter(v => !!v).join('/');
  }

  save(document: CmsTemplate | CmsApp, params: CmsParams) {
    const path = this.getPath(params);
    const ref = doc(this.firestore._db, path) as DocumentReference<CmsTemplate | CmsApp>;
    return updateDoc<CmsTemplate | CmsApp>(ref, document);
  }

  collection<T extends CmsTemplate | CmsApp>(params: CmsParams) {
    const path = this.getPath(params);
    const ref = collection(this.firestore._db, path) as CollectionReference<T>;
    return collectionData<T>(ref);
  }

  doc<T extends CmsTemplate | CmsApp>(params: CmsParams) {
    const path = this.getPath(params);
    const ref = doc(this.firestore._db, path) as DocumentReference<T>;
    return docData<T>(ref);
  }
}