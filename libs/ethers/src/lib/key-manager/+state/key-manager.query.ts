import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { KeyManagerStore, KeyState } from './key-manager.store';
import { map, filter, first } from 'rxjs/operators';
import { Key } from '../../types';

@Injectable({ providedIn: 'root' })
export class KeyManagerQuery extends QueryEntity<KeyState, Key> {
  constructor(protected store: KeyManagerStore) {
    super(store);
  }

  /**
   * Return an Observable of all keys stored for the logged user,
   * @param ensDomain the ENS domain name of the logged user (ex: `bob.blockframes.eth`)
   */
  selectUserKeys$(ensDomain: string) {
    return this.selectAll().pipe(
      map(keys => keys.filter(key => key.ensDomain === ensDomain)),
    );
  }

  /**
   * Return an Observable of all keys stored for the logged user that are linked to its erc10777,
   * i.e. all the keys that are able to send tx
   * @param ensDomain the ENS domain name of the logged user (ex: `bob.blockframes.eth`)
   */
  selectUserLinkedKeys$(ensDomain: string) {
    return this.selectAll().pipe(
      map(keys => keys.filter(key => key.ensDomain === ensDomain && (key.isLinked || key.isMainKey))),
    );
  }

  /**
   * Await that at least one key exist and return it as soon as it was created,
   * or simply return the first key if keys already exists
   * @param ensDomain the ENS domain name of the logged user (ex: `bob.blockframes.eth`)
   */
  async waitForFirstKeyOfUser(ensDomain: string) {
    return await this.selectUserKeys$(ensDomain).pipe(
      filter(keys => !!keys && keys.length > 0),
      map(keys => keys[0]),
      first()
    ).toPromise();
  }
  getKeysOfUser(ensDomain: string) {
    // return this.getAll().filter(key => key.ensDomain === ensDomain);
    return this.getAll({filterBy: key => key.ensDomain === ensDomain});
  }
  getMainKeyOfUser(ensDomain: string) {
    return this.getKeysOfUser(ensDomain).find(key => key.isMainKey);
  }
  getKeyCountOfUser(ensDomain: string) {
    return this.getKeysOfUser(ensDomain).length;
  }
}
