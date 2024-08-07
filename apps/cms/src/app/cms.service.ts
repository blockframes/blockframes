import { Injectable } from '@angular/core';
import { CmsTemplate, CmsApp } from '@blockframes/model';
import { CollectionReference, DocumentReference, updateDoc } from 'firebase/firestore';
import { fromRef, FirestoreService } from 'ngfire';
import { map } from 'rxjs';

export interface CmsParams {
  app?: string;
  page?: string;
  template?: string;
}

@Injectable({ providedIn: 'root' })
export class CmsService {

  constructor(private firestore: FirestoreService) { }

  private getPath({ app, page, template }: CmsParams) {
    return ['cms', app, page, template].filter(v => !!v).join('/');
  }

  save(document: CmsTemplate | CmsApp, params: CmsParams) {
    const path = this.getPath(params);
    const ref = this.firestore.getRef(path) as DocumentReference<CmsTemplate | CmsApp>;
    return updateDoc(ref, { ...document });
  }

  collection<T extends CmsTemplate | CmsApp>(params: CmsParams) {
    const path = this.getPath(params);
    const ref = this.firestore.getRef(path) as CollectionReference<T>;
    return fromRef(ref).pipe(map(snap => snap.docs.map(d => d.data())));
  }

  doc<T extends CmsTemplate | CmsApp>(params: CmsParams) {
    const path = this.getPath(params);
    const ref = this.firestore.getRef(path) as DocumentReference<T>;
    return fromRef(ref).pipe(map(snap => snap.data()));
  }
}