import { Injectable } from '@angular/core';
import { TransactionRequest, TransactionReceipt } from '@ethersproject/abstract-provider';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({ providedIn: 'root' })
export class Relayer {

  constructor(private functions: AngularFireFunctions) {}

  /**
   * Create a ERC1077 for one account
   * @param username ENS username of the account, this should `bob` and **NOT** `bob.blockframes.eth`
   * @param key first address of the user (management key)
   * @param erc1077address first address of the user (management key)
   */
  public deploy(username: string, key: string, orgAddress: string, erc1077address: string): Promise<Object> {
    if (username.split('.').length > 1) { // if you provide a full ENS domain anyway, we've got your back !
      username = username.split('.')[0]
    }
    const callDeploy = this.functions.httpsCallable('relayerDeploy');
    const deploy =  callDeploy({ username, key, orgAddress, erc1077address }).toPromise();
    return deploy;
  }

  /**
   * Register and link a name to an address
   * @param name ENS name , this should `bob` and **NOT** `bob.blockframes.eth`
   * @param address address to link the name with
   */
  public registerENSName(name: string, ethAddress: string): Promise<Object> {
    if (name.split('.').length > 1) { // if you provide a full ENS domain anyway, we've got your back !
      name = name.split('.')[0]
    }
    const callRegister = this.functions.httpsCallable('relayerRegister');
    const registration = callRegister({ name, ethAddress }).toPromise();
    return registration;
  }

  /** Send a transaction to the relayer  */
  public send(ethAddress: string, tx: TransactionRequest): Promise<TransactionReceipt> {
    const call = this.functions.httpsCallable('relayerSend');
    return call({ ethAddress, tx }).toPromise();
  }
}
