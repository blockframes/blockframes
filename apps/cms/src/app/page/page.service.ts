import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Page } from './page.model';

export interface PageParams {
  mode?: 'live' | 'template' | 'preview';
  app: string;
  page: string;
}

@Injectable({ providedIn: 'root' })
export class CmsPageService {

  constructor(private db: AngularFirestore) {}

  private getPath({ mode = 'live', app, page }: PageParams) {
    return `cms/${mode}/${app}/${page}`
  }

  save(doc: Page, params: PageParams) {
    const path = this.getPath(params);
    return this.db.doc(path).update(doc);
  }

  valueChanges(params: PageParams) {
    const path = this.getPath(params);
    return this.db.doc<Page>(path).valueChanges();
  }
}