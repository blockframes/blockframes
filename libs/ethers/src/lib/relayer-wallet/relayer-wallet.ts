import { Injectable } from '@angular/core';
import { ethers, utils, Wallet, providers } from 'ethers';

import { Provider } from '../provider/provider';
import { Relayer } from '../relayer/relayer';
import { Vault } from '../vault/vault';
import { baseEnsDomain } from '@env';
import { toASCII } from 'punycode';

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
  private async saveIntoVault(wallet: Wallet, keyName: string, password: string) {
    const encryptedJSON = await wallet.encrypt(password);
    this.vault.set(`${this.username}:${keyName}`, encryptedJSON);
  }

  private _requireUsername() {
    if (!this.username) throw new Error('the wallet\'s username is undefined, please call setUsername() before this function !');
  }
  private _requireSigningKey() {
    if(!this.signingKey) throw new Error('this wallet has no key, please create/restore/import a key !');
  }

  /** Convert email to username and sanitize it : convert to lower case punycode and replace special chars by their ASCII code
   * @example `漢micHel+9@exemple.com` -> `xn--michel439-2c2s`
   */
  public setUsername(email: string) {
    this.username = toASCII(email.split('@')[0]).toLowerCase()
      .split('')
      .map(char => /[^\w\d-.]/g.test(char) ? char.charCodeAt(0) : char) // replace every non a-z or 0-9 chars by their ASCII code : '?' -> '63'
      .join('');
  }

  /** Load a key from an encrypted JSON */
  public loadKey(keyName: string, password: string) {
    this._requireUsername();
    this.vault.get(`${this.username}:${keyName}`)
      .then(encryptedJSON => Wallet.fromEncryptedJson(encryptedJSON, password))
      .then(wallet => this._setSigningKey(wallet)).catch(_ => console.warn(`no key named "${this.username}:${keyName}" in local storage`));
  }

  /** Create a key from a mnemonic */
  public async importKey(mnemonic: string, keyName: string, password: string) {
    this._requireUsername();
    const wallet = Wallet.fromMnemonic(mnemonic);
    this._setSigningKey(wallet);
    this.saveIntoVault(wallet, keyName, password);
  }

  /** Create a wallet and store it into the vault */
  public async createLocalKey(keyName: string, password: string, email?: string) {
    if(email) this.setUsername(email);
    this._requireUsername();
    const wallet = Wallet.createRandom();
    this._setSigningKey(wallet);
    this.saveIntoVault(wallet, keyName, password);
  }

  /** Deploy a new ERC1077 contract with the current key */
  public async createERC1077(userId: string) {
    this._requireUsername();
    this._requireSigningKey();
    return this.relayer.create(userId, this.username, await this.getAddress());
  }

  /** Forget the signing key in the process memory */
  public logout() {
    delete this.username;
    delete this.signingKey;
  }

  public async getAddress(): Promise<string> {
    this._requireSigningKey();
    return this.signingKey.address;
  }

  public async signMessage(message: utils.Arrayish | string): Promise<string> {
    this._requireSigningKey();
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
    this._requireUsername();
    return this.relayer.send(this.username, transaction);
  }

  /** Retreive balance of the ERC1077 contract */
  public async getBalance(): Promise<string> {
    this._requireUsername();
    const balance = await this.provider.getBalance(`${this.username}.${baseEnsDomain}`).catch(error => {
      console.error('Ooops something bad happened when querying user balance :', error);
      return utils.bigNumberify(0);
    });
    return utils.formatEther(balance);
  }
}
