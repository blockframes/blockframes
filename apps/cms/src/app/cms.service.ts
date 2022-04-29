import { Injectable } from '@angular/core';
import { CmsTemplate, CmsApp } from '@blockframes/admin/cms';
import { OrganizationService } from '@blockframes/organization/+state';
import { collection, CollectionReference, doc, DocumentReference, updateDoc } from 'firebase/firestore';
import { fromRef, FirestoreService } from 'ngfire';
import { map } from 'rxjs';

export interface CmsParams {
  app?: string;
  page?: string;
  template?: string;
}

@Injectable({ providedIn: 'root' })
export class CmsService {

  //constructor(private firestoreService: FirestoreService) { }
  constructor(private firestore: OrganizationService) { } // TODO #8280

  private getPath({ app, page, template }: CmsParams) {
    return ['cms', app, page, template].filter(v => !!v).join('/');
  }

  save(document: CmsTemplate | CmsApp, params: CmsParams) {
    const path = this.getPath(params);
    //const ref = this.firestoreService.getRef(path) as DocumentReference<CmsTemplate | CmsApp>;
    const ref = doc(this.firestore._db, path) as DocumentReference<CmsTemplate | CmsApp>;
    return updateDoc<CmsTemplate | CmsApp>(ref, document);
  }

  collection<T extends CmsTemplate | CmsApp>(params: CmsParams) {
    const path = this.getPath(params);
    //const ref = this.firestoreService.getRef(path) as CollectionReference<T>;
    const ref = collection(this.firestore._db, path) as CollectionReference<T>;
    return fromRef(ref).pipe(map(snap => snap.docs.map(d => d.data())));
  }

  doc<T extends CmsTemplate | CmsApp>(params: CmsParams) {
    const path = this.getPath(params);
    //const ref = this.firestoreService.getRef(path) as DocumentReference<T>;
    const ref = doc(this.firestore._db, path) as DocumentReference<T>;
    return fromRef(ref).pipe(map(snap => snap.data()));
  }
}