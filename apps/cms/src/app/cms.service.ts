import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { CmsTemplate, CmsApp } from '@blockframes/admin/cms';

export interface CmsParams {
  app?: string;
  page?: string;
  template?: string;
}

@Injectable({ providedIn: 'root' })
export class CmsService {

  constructor(private db: AngularFirestore) {}

  private getPath({ app, page, template }: CmsParams) {
    return ['cms', app, page, template].filter(v => !!v).join('/');
  }

  save(doc: CmsTemplate | CmsApp, params: CmsParams) {
    const path = this.getPath(params);
    return this.db.doc(path).update(doc);
  }

  collection<T extends CmsTemplate | CmsApp>(params: CmsParams) {
    const path = this.getPath(params);
    return this.db.collection<T>(path).valueChanges();
  }

  doc<T extends CmsTemplate | CmsApp>(params: CmsParams) {
    const path = this.getPath(params);
    return this.db.doc<T>(path).valueChanges();
  }
}