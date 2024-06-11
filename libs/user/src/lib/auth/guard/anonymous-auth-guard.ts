import { Injectable } from '@angular/core';
import { AuthService } from '../service';

import { FirestoreService } from 'ngfire';
import { algoliaAnonymousSearchKeyDoc } from '@blockframes/utils/maintenance';
import { DocumentReference, getDoc } from 'firebase/firestore';
import { IAlgoliaKeyDoc } from '@blockframes/model';
import { setSearchKey } from '@blockframes/utils/algolia/helper.utils';

@Injectable({
  providedIn: 'root'
})
export class AnonymousAuthGuard {
  constructor(
    private authService: AuthService,
    private firestore: FirestoreService,
  ) { }

  async canActivate() {
    await this.authService.signInAnonymously();
    const doc = await getDoc(this.firestore.getRef(algoliaAnonymousSearchKeyDoc) as DocumentReference<IAlgoliaKeyDoc>);
    setSearchKey(doc.data());
    return true;
  }

}
