import { Injectable } from '@angular/core';
import { KeyManagerStore,Key } from './key-manager.store';
import { utils, Wallet as EthersWallet } from 'ethers';
import { MatSnackBar, MatDialog } from '@angular/material';
import { KeyManagerQuery } from './key-manager.query';

@Injectable({ providedIn: 'root' })
export class KeyManagerService {

  private signingKey: utils.SigningKey;

  constructor(
    private dialog: MatDialog,
    private store: KeyManagerStore,
    private query: KeyManagerQuery,
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
    let isMainKey = false;
    if (this.query.getKeyCountOfUser(ensDomain) === 0) {
      isMainKey = true;
    }
    const key = {address: wallet.address, ensDomain, keyStore, isMainKey};
    this.store.add(key);
    this._activateKey(key.address, wallet); // ? Should creating a key also activate this key ?
    this.store.setLoading(false);
  }

  /**  create / encrypt / store / from random */
  async createFromRandom(ensDomain: string, password: string) { // at signup password is already provided and we don't want to ask again

    const wallet = EthersWallet.createRandom();
    this._encryptAndStore(wallet, ensDomain, password);
    return wallet.address;
  }
  /** create / encrypt / store / from mnemonic */
  importFromMnemonic(ensDomain: string, mnemonic: string, encryptionPassword: string) {
    const privateKey = utils.HDNode.mnemonicToEntropy(mnemonic); // mnemonic is a 24 word phrase corresponding to private key !== BIP32/39 seed phrase
    this.importFromPrivateKey(ensDomain, privateKey, encryptionPassword);
  }
  /** create / encrypt / store / from private key */
  importFromPrivateKey(ensDomain: string, privateKey: string, encryptionPassword: string) {
    const wallet = new EthersWallet(privateKey);
    this._encryptAndStore(wallet, ensDomain, encryptionPassword);
  }

  importFromJsonFile(jsonString: string) {
    const {address, ensDomain, keyStore, isMainKey} = JSON.parse(jsonString);
    this.store.add({address, ensDomain, keyStore, isMainKey});
  }

  /** load key (retreive / decrypt, set into process memory) */
  async unlockAndSetActive(key: Key, encryptionPassword: string) {

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
    this.store.remove(key.address);
  }

  /** export key */
  async exportActiveKey() {
    this._requireSigningKey();
    const wallet = new EthersWallet(this.signingKey);
    // TODO add a way to show the mnemonic
  }

  signMessage(message: utils.Arrayish): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
