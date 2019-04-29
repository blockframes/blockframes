import { Injectable } from '@angular/core';
import { ethers, utils, Wallet, providers } from 'ethers';

import { Provider } from '../provider/provider';
import { Relayer } from '../relayer/relayer';
import { Vault } from '../vault/vault';
import { baseEnsDomain } from '@env';

type txRequest = providers.TransactionRequest;
type txResponse = providers.TransactionResponse;

@Injectable({ providedIn: 'root' })
export class RelayerWallet implements ethers.Signer {
  private signingKey: utils.SigningKey;
  public username: string;

  constructor(
    private vault: Vault,
    private relayer: Relayer,
    public provider: Provider
  ) {}

  /** Set signing key into process memory */
  private _setSigningKey(wallet: Wallet) {
    this.signingKey = new utils.SigningKey(wallet.privateKey);
  }

  /** Save the encryptedJSON into the vault */
  private async saveIntoVault(wallet: Wallet, username: string, password: string) {
    const encryptedJSON = await wallet.encrypt(password);
    this.vault.set(`${username}:web`, encryptedJSON);
  }

  /** Get the signing key from an encrypted JSON */
  public login(username: string, password: string) {
    this.username = username;
    this.vault.get(`${username}:web`)
      .then(encryptedJSON => Wallet.fromEncryptedJson(encryptedJSON, password))
      .then(wallet => this._setSigningKey(wallet));
  }

  /** Get the signing key from a mnemonic */
  public async importMnemonic(mnemonic: string, username: string, password: string) {
    this.username = username;
    const wallet = Wallet.fromMnemonic(mnemonic);
    this._setSigningKey(wallet);
    this.saveIntoVault(wallet, username, password);
  }

  /** Create a wallet and store it into the vault */
  public async signup(uid: string, username: string, password: string) {
    const wallet = Wallet.createRandom();
    this._setSigningKey(wallet);
    await this.relayer.create(uid, username, wallet.address);
    await this.saveIntoVault(wallet, username, password);
  }

  /** Forget the signing key in the process memory */
  public logout() {
    delete this.username;
    delete this.signingKey;
  }

  public async getAddress(): Promise<string> {
    return this.signingKey.address;
  }

  public async signMessage(message: utils.Arrayish | string): Promise<string> {
    // Here ask permission
    const msg =
      typeof message === 'string' && message.slice(0, 2) === '0x'
        ? utils.arrayify(message)
        : message;
    const hash = utils.hashMessage(msg);
    const signature = this.signingKey.signDigest(hash);
    return utils.joinSignature(signature);
  }

  public async sendTransaction(transaction: txRequest): Promise<txResponse> {
    return this.relayer.send(this.username, transaction);
  }

  /** Retreive balance of the ERC1077 contract */
  public async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(`${this.username}.${baseEnsDomain}`);
    return utils.formatEther(balance);
  }
}
