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

  public create(name: string, key: string): Promise<Object> {
    const call = this.functions.httpsCallable('relayerCreate');
    return call({ name, key }).toPromise();
  }
  public async prepare(name: string): Promise<EventFilter> {
    const namehash = utils.namehash(`${name}.${contracts.testErc1077.baseEnsDomain[network]}`);
    return <EventFilter>{
      address: contracts.testErc1077.resolver[network],
      topics: [
        '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2', // this is the topic of the event NameChanged(bytes32,string)
        namehash
      ]
    };
  }
  send(name: string, tx: providers.TransactionRequest): Promise<providers.TransactionResponse> {
    const call = this.functions.httpsCallable('relayerSend');
    return call({ name, tx }).toPromise();
  }
  addKey(name: string, key: string): Promise<Object> {
    const call = this.functions.httpsCallable('relayerAddKey');
    return call({ name, key }).toPromise();
  }
  removeKey(name: string, key: string): Promise<Object> {
    const call = this.functions.httpsCallable('relayerRemoveKey');
    return call({ name, key }).toPromise();
  }
}
