import { Injectable } from '@angular/core';
import { StoreConfig, EntityStore, EntityState, ActiveState } from '@datorama/akita';

export interface Key {
  name: string,
  ensDomain: string,
  keyStore: string,
  address: string,
  isMainKey: boolean,
}

export interface KeyState extends EntityState<Key>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'key', idKey: 'address' })
export class KeyManagerStore extends EntityStore<KeyState, Key> {
  constructor() {
    super();
    this.setLoading(false);
  }
}
