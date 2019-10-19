import { Injectable } from '@angular/core';
import { StoreConfig, EntityStore, EntityState, ActiveState } from '@datorama/akita';
import { Key } from '@blockframes/utils';
import { BehaviorSubject } from 'rxjs';

export interface KeyState extends EntityState<Key>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'key', idKey: 'address' })
export class KeyManagerStore extends EntityStore<KeyState, Key> {

  public progress$ = new BehaviorSubject<number>(0);

  set progress(value: number) {
    this.progress$.next(value);
  }

  constructor() {
    super();
    this.setLoading(false);
  }
}
