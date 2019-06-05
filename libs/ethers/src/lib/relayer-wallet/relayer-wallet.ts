import { Injectable } from '@angular/core';
import { ethers, utils, Wallet, providers } from 'ethers';

import { Provider } from '../provider/provider';
import { Relayer } from '../relayer/relayer';
import { LocalStorageVault } from '../vault/vault';
import { baseEnsDomain } from '@env';
import { toASCII } from 'punycode';
import { MatDialog } from '@angular/material/dialog';
// import { AskPasswordComponent } from '../wallet/ask-password/ask-password.component';
import { BehaviorSubject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

type txRequest = providers.TransactionRequest;
type txResponse = providers.TransactionResponse;

@Injectable({ providedIn: 'root' })
export class RelayerWallet implements ethers.Signer {
  private signingKey: utils.SigningKey;
  // TODO : Add this in Wallet Store
  private _username = new BehaviorSubject<string>(null);
  public username$ = this._username.asObservable();

  constructor(
    private dialog: MatDialog,
    // private vault: LocalStorageVault,
    private relayer: Relayer,
    public provider: Provider
  ) {}

  get username() {
    return this._username.getValue();
  }
  set username(name: string) {
    this._username.next(name);
  }

  /** check if there is a keystore for the current user */
  // get hasKeystore$() {
  //   return this.username$.pipe(
  //     switchMap(username => this.vault.select(`${username}:web`)),// TODO remove hardcoded ":web"
  //     map(json => !!json)
  //   );
  // }

  /** Set signing key into process memory */
  private _setSigningKey(wallet: Wallet) {
    this.signingKey = new utils.SigningKey(wallet.privateKey);
  }

  /** Save the encryptedJSON into the vault */
  // private async saveIntoVault(wallet: Wallet, keyName: string, password: string) {
    // const encryptedJSON = await wallet.encrypt(password);
    // this.vault.set(`${this.username}:${keyName}`, encryptedJSON);
  // }

  /** Return the signing key or ask  */
  private async getSigningKey(): Promise<utils.SigningKey> {
    if (this.signingKey) return this.signingKey;
    // return this.askPassword()
  }

  /** Open a dialog to get the password */
  // private async askPassword() {
  //   const ref = this.dialog.open(AskPasswordComponent, { width: '250px' })
  //   const password = await ref.afterClosed().toPromise()
  //   if (!password) throw new Error('No password provided');
  //   return this.loadKey('web', password); // TODO : Don't hardcode "web"
  // }

  private _requireUsername() {
    if (!this.username) throw new Error('the wallet\'s username is undefined, please call setUsername() before this function !');
  }
  private _requireSigningKey() {
    if(!this.signingKey) throw new Error('this wallet has no key, please create/restore/import a key !');
  }

  /** Get the private Key of the current wallet */
  async privateKey(): Promise<string> {
    const { privateKey } = await this.getSigningKey();
    return privateKey;
  }

  

  /** Load a key from an encrypted JSON */
  public async loadKey(keyName: string, password: string) {
    try {
      this._requireUsername();
      // const json = await this.vault.get(`${this.username}:${keyName}`);
      // if (!json) throw new Error(`no key named "${this.username}:${keyName}" in local storage`);
      // const wallet = await Wallet.fromEncryptedJson(json, password);
      // this._setSigningKey(wallet);
      return this.signingKey;
    } catch (err) {
      throw new Error(err);
    }
  }

  public async recoverWithPrivateKey(privateKey: string, password: string) {
    this._requireUsername();
    const wallet = new Wallet(privateKey);
    const json = await wallet.encrypt(password);
    // await this.vault.set(`${this.username}:web`, json); // TODO remove hardcoded ":web"
  }

  /** Create a key from a mnemonic */
  public async importKey(mnemonic: string, keyName: string, password: string) {
    this._requireUsername();
    const wallet = Wallet.fromMnemonic(mnemonic);
    this._setSigningKey(wallet);
    // this.saveIntoVault(wallet, keyName, password);
  }

  /** Create a key and store it into the vault */
  public async createLocalKey(keyName: string, password: string, email?: string) {
    // if(email) this.setUsername(email);
    this._requireUsername();
    const wallet = Wallet.createRandom();
    this._setSigningKey(wallet);
    // this.saveIntoVault(wallet, keyName, password);
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

  public async requestTokens(amount: number) {
    this._requireUsername();
    const tx = await this.relayer.requestTokens(this.username, amount);
    await this.provider.waitForTransaction(tx.hash)
  }

  public async signDelivery(deliveryId: string, stakeholderId: string) {
    this._requireUsername();
    try {
      return this.relayer.signDelivery(this.username, deliveryId, stakeholderId);
    } catch (error) {
      console.error('The relayer has failed to forward the signature to the blockchain');
    }
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
      return utils.bigNumberify(0);
    });
    return utils.formatEther(balance);
  }

  // TODO
  // public async balance$() {
  //   this._requireUsername();
  //   const address = await this.provider.resolveName(this.username);
  //   return new Observable<string>(observer => {
  //     const {next} = observer;
  //     this.provider.on(address , balance => next(utils.formatEther(balance)));
  //     return {unsubscribe() {this.provider.removeAllListener(address);}}
  //   });
  // }
}
