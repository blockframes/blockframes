import { Injectable } from '@angular/core';
import { StoreConfig, EntityStore, EntityState, ActiveState } from '@datorama/akita';
import { Key } from '@blockframes/utils';

export interface KeyState extends EntityState<Key>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'key', idKey: 'address' })
export class KeyManagerStore extends EntityStore<KeyState, Key> {
  constructor() {
    super();
    this.setLoading(false);
  }
}
