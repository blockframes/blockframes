import { Injectable } from '@angular/core';
import { providers, EventFilter, utils } from 'ethers';
import firebase from 'firebase';
import { AngularFireFunctions } from '@angular/fire/functions';

import { contracts, network } from '@env';

export interface IRelayer {
  create(name: string, key: string): Promise<Object>;
  prepare(name: string): Promise<EventFilter>;
  send(name: string, tx: providers.TransactionRequest): Promise<providers.TransactionResponse>;
  addKey(name: string, key: string): Promise<Object>;
  removeKey(name: string, key: string): Promise<Object>;
}

@Injectable({ providedIn: 'root' })
export class Relayer implements IRelayer {

  constructor(private functions: AngularFireFunctions) {}

  /**
   * Create a ERC1077 for one account
   * @param username ENS username of the account
   * @param key first address of the user (management key)
   */
  public create(username: string, key: string): Promise<Object> {
    const call = this.functions.httpsCallable('relayerCreate');
    return call({ username, key }).toPromise();
  }

  /** Listen when the ENS name changed -> End of process */
  public async prepare(username: string): Promise<EventFilter> {
    const namehash = utils.namehash(`${username}.${contracts.testErc1077.baseEnsDomain[network]}`);
    return <EventFilter>{
      address: contracts.testErc1077.resolver[network],
      topics: [
        '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2', // this is the topic of the event NameChanged(bytes32,string)
        namehash
      ]
    };
  }

  /** Send a transaction to the relayer  */
  send(username: string, tx: providers.TransactionRequest): Promise<providers.TransactionResponse> {
    const call = this.functions.httpsCallable('relayerSend');
    return call({ username, tx }).toPromise();
  }

  /** Add an address to the ERC1077 */
  addKey(username: string, key: string): Promise<Object> {
    const call = this.functions.httpsCallable('relayerAddKey');
    return call({ username, key }).toPromise();
  }

  /** Remove an address of the ERC1077 */
  removeKey(username: string, key: string): Promise<Object> {
    const call = this.functions.httpsCallable('relayerRemoveKey');
    return call({ username, key }).toPromise();
  }
}
