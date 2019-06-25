import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { KeyManagerStore, Key, KeyState } from './key-manager.store';
import { map, filter, first } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class KeyManagerQuery extends QueryEntity<KeyState, Key> {
  constructor(protected store: KeyManagerStore) {
    super(store);
  }

  /**
   * Return an Observable of all keys stored for the logged user,
   * @param ensDomain the ENS domain name of the logged user (ex: `bob.blockframes.eth`)
   */
  selectAllKeysOfUser$(ensDomain: string) {
    return this.selectAll().pipe(
      map(keys => keys.filter(key => key.ensDomain === ensDomain)),
    );
  }

  /**
   * Await that at least one key exist and return it as soon as it was created,
   * or simply return the first key if keys already exists
   * @param ensDomain the ENS domain name of the logged user (ex: `bob.blockframes.eth`)
   */
  async waitForFirstKeyOfUser(ensDomain: string) {
    return await this.selectAllKeysOfUser$(ensDomain).pipe(
      filter(keys => !!keys && keys.length > 0),
      map(keys => keys[0]),
      first()
    ).toPromise();
  }
  getMainKeyOfUser(ensDomain: string) {
    return this.getAll().find(key => key.isMainKey && key.ensDomain === ensDomain);
  }
  getKeyCountOfUser(ensDomain: string) {
    return this.getAll().filter(key => key.ensDomain === ensDomain).length;
  }
}
