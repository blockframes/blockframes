import { inject } from '@angular/core';
import { FireAuth, FireCollection, FireEntity, FireSubCollection } from 'ngfire';
import { App, User } from '@blockframes/model';
import { APP } from './routes/utils';
import { tap } from 'rxjs';

export abstract class BlockframesCollection<T> extends FireCollection<T> {
  protected app: App = inject(APP);

  memorize = true;

  storeId = true;

  protected toFirestore(document: FireEntity<T>, actionType: 'add' | 'update') {
    return document;
  }

}

export abstract class BlockframesSubCollection<T> extends FireSubCollection<T> {
  protected app: App = inject(APP);

  memorize = true;

  storeId = true;

  protected toFirestore(document: FireEntity<T>, actionType: 'add' | 'update') {
    return document;
  }
}

export abstract class BlockframesAuth<T> extends FireAuth<T> {
  protected app: App = inject(APP);

  profile: User; // User object in Firestore DB
  uid: string; // Will be defined for regular and anonymous users

  protected _user$ = this.user$.pipe(tap(auth => {
    this.uid = auth?.uid;
    if (!auth?.uid) this.profile = undefined;
  }));

  protected toFirestore(document: Partial<T>, actionType: 'add' | 'update') {
    return document;
  }
}