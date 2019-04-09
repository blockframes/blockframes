import { Injectable } from '@angular/core';
import { ethers, utils, Wallet, providers } from 'ethers';

import { Provider } from '../provider/provider';
import { Relayer } from '../relayer/relayer';
import { Vault } from '../vault/vault';

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

  /** Set into process memory */
  private loginWithEncryptedJSON(wallet: Wallet, username: string) {
    this.username = username;
    this.signingKey = new utils.SigningKey(wallet.privateKey);
  }

  /** Save the encryptedJSON into the vault */
  private async saveIntoVault(wallet: Wallet, username: string, password: string) {
    const encryptedJSON = await wallet.encrypt(password);
    this.vault.set(`${username}:web`, encryptedJSON);
  }

  /** Get the signing key from an encrypted JSON */
  public async login(username: string, password: string) {
    if (password.length < 5) throw new Error('Password must contains at least 6 charachters');
    const encryptedJSON = await this.vault.get(`${username}:web`);
    const wallet = await Wallet.fromEncryptedJson(encryptedJSON, password);
    this.loginWithEncryptedJSON(wallet, username);
  }

  /** Get the signing key from a mnemonic */
  public async importMnemonic(mnemonic: string, username: string, password: string) {
    const wallet = Wallet.fromMnemonic(mnemonic);
    this.loginWithEncryptedJSON(wallet, username);
    this.saveIntoVault(wallet, username, password);
  }

  /** Create a wallet and store it into the vault */
  public async signup(username: string, password: string) {
    const wallet = Wallet.createRandom();
    this.loginWithEncryptedJSON(wallet, username);
    this.saveIntoVault(wallet, username, password);
    // this.relayer.create(username, wallet.address); // TODO uncomment when relayer CORS bug is fixed
    // TODO track the state of the creation process, prevent the user to close his tab before the process has ended, flag somwhere in the state when process has ended
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
}
