import { Injectable } from '@angular/core';
import { KeyManagerStore, Key } from './key-manager.store';
import { utils, Wallet as EthersWallet } from 'ethers';
import { KeyManagerQuery } from './key-manager.query';

@Injectable({ providedIn: 'root' })
export class KeyManagerService {

  private signingKey: utils.SigningKey;

  constructor(
    private store: KeyManagerStore,
    private query: KeyManagerQuery,
  ) {}

  /** Set signing key into process memory */
  private setSigningKey(wallet: EthersWallet) {
    this.signingKey = new utils.SigningKey(wallet.privateKey);
  }

  private requireSigningKey() {
    if (!this.signingKey) {
      throw new Error('A signing key is required !');
    }
  }

  private async encrypt(keyName: string, wallet: EthersWallet, ensDomain: string, encryptionPassword: string): Promise<Key> {
    this.store.setLoading(true);
    const keyStore = await wallet.encrypt(encryptionPassword);
    let isMainKey = false;
    if (this.query.getKeyCountOfUser(ensDomain) === 0) {
      isMainKey = true;
    }
    const key = {name: keyName, address: wallet.address, ensDomain, keyStore, isMainKey};
    this.store.setLoading(false);
    return key;
  }

  /**  create / encrypt / from random */
  async createFromRandom(keyName: string, ensDomain: string, password: string): Promise<Key> {
    const wallet = EthersWallet.createRandom();
    return await this.encrypt(keyName, wallet, ensDomain, password);
  }
  /** create / encrypt / from mnemonic
  * @param keyName the name of the new key
  * @param ensDomain the ens name of the new key owner
  * @param mnemonic the seed phrase to transform into a new key
  * @param encryptionPassword a password to encrypt the new key
  */
  async importFromMnemonic(keyName:string, ensDomain: string, mnemonic: string, encryptionPassword: string) {
    const privateKey = utils.HDNode.mnemonicToEntropy(mnemonic); // mnemonic is a 24 word phrase corresponding to private key !== BIP32/39 seed phrase
    return this.importFromPrivateKey(keyName, ensDomain, privateKey, encryptionPassword);
  }
  /** create / encrypt / from private key
  * @param keyName the name of the new key
  * @param ensDomain the ens name of the new key owner
  * @param privateKey the private key to transform into a new key
  * @param encryptionPassword a password to encrypt the new key
  */
  async importFromPrivateKey(keyName:string, ensDomain: string, privateKey: string, encryptionPassword: string) {
    const wallet = new EthersWallet(privateKey);
    return this.encrypt(keyName, wallet, ensDomain, encryptionPassword);
  }
  /** store an encrypted key to the storage */
  public storeKey(key: Key) {
    this.store.add(key);
  }

  importFromJsonFile(jsonString: string) {
    const {address, ensDomain, keyStore} = JSON.parse(jsonString);
    let isMainKey = false;
    if (this.query.getKeyCountOfUser(ensDomain) === 0) {
      isMainKey = true;
    }
    this.store.add({name, address, ensDomain, keyStore, isMainKey});
  }

  /** load key (retreive / decrypt, set into process memory) */
  async unlockAndSetActive(key: Key, encryptionPassword: string) {

    this.store.setLoading(true);
    try {
      const wallet = await EthersWallet.fromEncryptedJson(key.keyStore, encryptionPassword)
      this.activateKey(key.address, wallet);
      this.store.setLoading(false);
    }
    catch(error) {
      this.store.setLoading(false);
      throw new Error('Invalid Password');
    };
  }

  private activateKey(id: string, wallet: EthersWallet){
    this.setSigningKey(wallet);
    this.store.setActive(id);
  }
  /** clean process memory */
  deactivateKey() {
    this.store.setActive(null);
    delete this.signingKey;
  }

  /** delete a stored key (from the storage)*/
  async deleteKey(key: Key) {
    this.store.remove(key.address);
  }

  /** export key : expose it's mnemonic/private key */
  async exportActiveKey() {
    this.requireSigningKey();
    const wallet = new EthersWallet(this.signingKey);
    // TODO add a way to show the mnemonic
  }

  signMessage(message: utils.Arrayish): Promise<string> {
    throw new Error("Method not implemented.");
  }

  /** get the default name of the next key to create : `Key_1`, `Key_2`, `Key_3`, etc... */
  getDefaultKeyName(ensDomain: string) {
    return `Key_${this.query.getKeyCountOfUser(ensDomain) + 1}`;
  }
}
