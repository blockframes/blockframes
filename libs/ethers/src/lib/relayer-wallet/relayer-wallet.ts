import { Injectable, Inject } from '@angular/core';
import { ethers, utils, Wallet, providers } from 'ethers';

import { Provider } from '../provider/provider';
import { Relayer } from '../relayer/relayer';

@Injectable({ providedIn: 'root' })
export class RelayerWallet extends ethers.Signer {
  private signingKey: utils.SigningKey;
  public username: string;

  constructor(public provider: Provider, private relayer: Relayer) {
    super();
  }

  async loginFromEncryptedJSON(username: string, encryptedJSON: string, password: string) {
    if (password.length < 5) throw new Error('Password must contains at least 6 charachters');
    this.username = username;
    const wallet = await Wallet.fromEncryptedJson(encryptedJSON, password);
    this.signingKey = new utils.SigningKey(wallet.privateKey);
  }
  async loginFromMnemonic(username: string, mnemonic: string) {
    this.username = username;
    const wallet = Wallet.fromMnemonic(mnemonic);
    this.signingKey = new utils.SigningKey(wallet.privateKey);
  }
  logout() {
    this.username = undefined;
    this.signingKey = undefined;
  }

  async getAddress(): Promise<string> {
    return this.signingKey.address;
  }

  async signMessage(message: utils.Arrayish | string): Promise<string> {
    // Here ask permission
    const msg =
      (typeof message === 'string') && (message.slice(0, 2) === '0x')
        ? utils.arrayify(message)
        : message;
    const hash = utils.hashMessage(msg);
    const signature = this.signingKey.signDigest(hash);
    return utils.joinSignature(signature);
  }

  async sendTransaction(
    transaction: providers.TransactionRequest
  ): Promise<providers.TransactionResponse> {
    return this.relayer.send(this.username, transaction);
  }
}
