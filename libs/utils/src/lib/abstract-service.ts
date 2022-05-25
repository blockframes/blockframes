import { inject } from '@angular/core';
import { FireAuth, FireCollection, FireEntity, FireSubCollection } from 'ngfire';
import { App } from '@blockframes/model';
import { APP } from './routes/utils';

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

  protected toFirestore(document: Partial<T>, actionType: 'add' | 'update') {
    return document;
  }
}