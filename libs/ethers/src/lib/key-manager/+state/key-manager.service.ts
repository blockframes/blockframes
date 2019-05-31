import { Injectable } from '@angular/core';
import { KeyManagerStore,Key } from './key-manager.store';
import { utils, Wallet as EthersWallet } from 'ethers';
import { MatSnackBar, MatDialog } from '@angular/material';
import { AskPasswordComponent } from '../ask-password/ask-password.component';
import { CreatePasswordComponent } from '../create-password/create-password.component';
import { ExportComponent } from '../export-dialog/export-dialog.component';

@Injectable({ providedIn: 'root' })
export class KeyManagerService {

  private signingKey: utils.SigningKey;

  constructor(
    private dialog: MatDialog,
    private store: KeyManagerStore,
    private snackBar: MatSnackBar,
  ) {}

  /** Set signing key into process memory */
  private _setSigningKey(wallet: EthersWallet) {
    this.signingKey = new utils.SigningKey(wallet.privateKey);
  }

  private _requireSigningKey() {
    if (!this.signingKey) {
      throw new Error('A signing key is required !');
    }
  }

  private async _encryptAndStore(wallet: EthersWallet, ensDomain: string, encryptionPassword: string) {
    this.store.setLoading(true);
    const keyStore = await wallet.encrypt(encryptionPassword);
    const key = {address: wallet.address, ensDomain, keyStore};
    this.store.add(key);
    this._activateKey(key.address, wallet); // ? Should creating a key also activate this key ?
    this.store.setLoading(false);
  }

  /**  create / encrypt / store / from random */
  async createFromRandom(ensDomain: string, password?: string) { // at signup password already is provided and we don't want to ask again for a password
    if (!password) {
      const ref = this.dialog.open(CreatePasswordComponent, { width: '250px' });
      password = await ref.afterClosed().toPromise();
      if (!password) {
        throw new Error('No password provided');
      }
    }

    const wallet = EthersWallet.createRandom();
    this._encryptAndStore(wallet, ensDomain, password);
  }
  /** create / encrypt / store / from mnemonic */
  importFromMnemonic(ensDomain: string, mnemonic: string, encryptionPassword: string) {
    const wallet = EthersWallet.fromMnemonic(mnemonic);
    this._encryptAndStore(wallet, ensDomain, encryptionPassword);
  }
  /** create / encrypt / store / from private key */
  importFromPrivateKey(ensDomain: string, privateKey: string, encryptionPassword: string) {
    const wallet = new EthersWallet(privateKey);
    this._encryptAndStore(wallet, ensDomain, encryptionPassword);
  }

  /** load key (retreive / decrypt, set into process memory) */
  async unlockAndSetActive(key: Key) {
    const ref = this.dialog.open(AskPasswordComponent, { width: '250px' })
    const encryptionPassword = await ref.afterClosed().toPromise()
    if (!encryptionPassword) throw new Error('No password provided');

    this.store.setLoading(true);
    try {
      const wallet = await EthersWallet.fromEncryptedJson(key.keyStore, encryptionPassword)
      this._activateKey(key.address, wallet);
      this.store.setLoading(false);
    }
    catch(error) {
      this.store.setLoading(false);
      throw new Error('Invalid Password');
    };
  }

  private _activateKey(id: string, wallet: EthersWallet){
    this._setSigningKey(wallet);
    this.store.setActive(id);
  }
  /** clean process memory */
  deactivateKey() {
    this.store.setActive(null);
    delete this.signingKey;
  }

  /** delete key */
  async deleteKey(key: Key) {
    const ref = this.dialog.open(AskPasswordComponent, { width: '250px' });
    const password = await ref.afterClosed().toPromise();
    if (!password) {
      throw new Error('No password provided');
    }
    this.store.remove(key.address);
  }

  /** export key */
  async exportActiveKey() {
    this._requireSigningKey();
    const wallet = new EthersWallet(this.signingKey);
    const ref = this.dialog.open(ExportComponent, { width: '500px', data: {wallet} });
    await ref.afterClosed().toPromise();
  }

}
