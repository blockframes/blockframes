import { Injectable } from '@angular/core';
import { KeyManagerStore } from './key-manager.store';
import { Contract } from '@ethersproject/contracts';
import { Wallet as EthersWallet } from '@ethersproject/wallet';

import { KeyManagerQuery } from './key-manager.query';
import { network } from '@env';
import { abi as ERC1077_ABI } from '@blockframes/contracts/ERC1077.json';
import { SigningKey } from '@ethersproject/signing-key';
import { mnemonicToEntropy, entropyToMnemonic } from '@ethersproject/hdnode';
import { Key } from '../../types';
import { getProvider } from '../../helpers';

@Injectable({ providedIn: 'root' })
export class KeyManagerService {

  private signingKey: SigningKey;

  constructor(
    private store: KeyManagerStore,
    private query: KeyManagerQuery,
  ) {}

  private async encrypt(keyName: string, wallet: EthersWallet, ensDomain: string, encryptionPassword: string): Promise<Key> {
    this.store.setLoading(true);
    this.store.update({progress: 0});

    const keyStore = await wallet.encrypt(
      encryptionPassword,
      null,
      (progress) => { this.store.update({progress: Math.round(progress * 100)}); }
    );

    const isMainKey = this.query.getKeyCountOfUser(ensDomain) === 0;
    const key = {name: keyName, address: wallet.address, ensDomain, keyStore, isMainKey, isLinked: false};
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
    const privateKey = mnemonicToEntropy(mnemonic); // mnemonic is a 24 word phrase corresponding to private key !== BIP32/39 seed phrase
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

  /**
  * create or update a key into the vault
  */
  public storeKey(key: Key) {
    this.store.upsert(key.address, key);
  }

  async importFromJsonFile(jsonString: string) {
    const {address, ensDomain, keyStore} = JSON.parse(jsonString);
    const isMainKey = this.query.getKeyCountOfUser(ensDomain) === 0;

    const provider = getProvider(network);

    const erc1077 = new Contract(ensDomain, ERC1077_ABI, provider);
    const isLinked = await erc1077.keyExist(address);
    this.store.add({name, address, ensDomain, keyStore, isMainKey, isLinked});
  }

  /**
   * load key (retrieve / decrypt, set into process memory).
   * Set the KeyManager loading flag to `true` during decryption.
   */
  async unlockKey(key: Key, encryptionPassword: string) {

    this.store.setLoading(true);
    this.store.update({progress: 0});
    try {
      const wallet = await EthersWallet.fromEncryptedJson(
        key.keyStore,
        encryptionPassword,
        (progress) => { this.store.update({progress: Math.round(progress * 100)}); }
      );
      this.store.setLoading(false);
      return wallet;
    }
    catch(error) {
      this.store.setLoading(false);
      throw new Error('Invalid Password');
    };
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

  /** get the default name of the next key to create : `Key_1`, `Key_2`, `Key_3`, etc... */
  getDefaultKeyName(ensDomain: string) {
    return `Key_${this.query.getKeyCountOfUser(ensDomain) + 1}`;
  }

  /** extract the Mnemonic from a wallet */
  extractMnemonic(wallet: EthersWallet) {
    const privateKey = wallet.privateKey;
    const mnemonic = entropyToMnemonic(privateKey);
    return mnemonic;
  }
}
