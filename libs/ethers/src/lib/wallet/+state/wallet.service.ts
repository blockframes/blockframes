import { Injectable, Inject, InjectionToken } from '@angular/core';
import { Signer, providers } from 'ethers';
import { PROVIDER } from '../../tokens';
import { WalletStore } from './wallet.store';
import { utils, ethers } from 'ethers';
import { KeyPair } from 'ethers/utils/secp256k1';
import { WalletQuery } from './wallet.query';

// TODO : Implements cryptographic methods

export type lang = 'en' | 'es' | 'fr' | 'ja' | 'ko' | 'it' | 'zh_ch' | 'zh_tw';

export interface Vault {
  getItem(key: string): string
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

export const VAULT = new InjectionToken<Vault>('Vault for your private key', {
  providedIn: 'root',
  factory: () => localStorage
})

@Injectable({
  providedIn: 'root'
})
export class NgWallet extends Signer {

  constructor(
    @Inject(PROVIDER) public provider: providers.BaseProvider,
    @Inject(VAULT) private vault: Vault,
    private store: WalletStore,
    private query: WalletQuery,
  ) {
    super();
  }

  get address() {
    return this.query.getSnapshot().address;
  }
  // TODO : Change private key with keystore everywhere
  get privateKey() {
    return this.query.getSnapshot().privateKey;
  }

  /** Create a wallet with a random mnemonic */
  public createRandom(language?: lang) {
    const mnemnonic = this.randomMnemonic(language);
    this.fromMnemonic(mnemnonic);
  }

  /** Create a random mnemnonic */
  public randomMnemonic(language: lang = 'en') {
    const bytes = utils.randomBytes(16);
    const workList = ethers.wordlists[language];
    return ethers.utils.HDNode.entropyToMnemonic(bytes, workList)
  }

  /** Get the private key from the mnemonic and path */
  public fromMnemonic(mnemonic: string, derivationPath: string = `m/44'/60'/0'/0/0`) {
    const hdnode = utils.HDNode.fromMnemonic(mnemonic).derivePath(derivationPath);
    const { address, privateKey } = hdnode;
    this.store.update({address, privateKey});
  }

  /** Save the private key intp localstorage */
  public async save(password: string) {
    // const encrypted = await this.encrypt(password);
    this.vault.setItem('keystore', this.privateKey);
    return true;
  }

  /** Encrypt the private key into a keystore */
  public encrypt(password: string) {
    // return encrypt(privateKey, password);
  }


  /** Return the address of the current account */
  public async getAddress(): Promise<string> {
    return this.address;
  }

  /** Send a transaction to the current */
  public async sendTransaction(transaction: providers.TransactionRequest) {
    if (!this.privateKey) {
      throw new Error('Wallet is not connected to an account yet');
      // TODO : open Wallet and ask for password
    }
    if (transaction.nonce == null) {
      transaction = utils.shallowCopy(transaction);
      transaction.nonce = this.provider.getTransactionCount(this.address, 'pending');
    }
    const tx = await utils.populateTransaction(transaction, this.provider, this.address)
    const signedTx = await this.sign(tx);
    return this.provider.sendTransaction(signedTx)
  }

  /** Sign a Message with the private key */
  public async signMessage(message: string): Promise<string> {
    const signer = new KeyPair(this.privateKey);
    const signature = signer.sign(utils.hashMessage(message));
    return utils.joinSignature(signature)
  }

  /** Sign a transaction */
  public async sign(transaction: providers.TransactionRequest){
    const tx = await utils.resolveProperties(transaction);
    const rawTx = utils.serializeTransaction(tx);
    const signer = new KeyPair(this.privateKey);
    const signature = signer.sign(utils.keccak256(rawTx));
    return utils.serializeTransaction(tx, signature);
  }
}
