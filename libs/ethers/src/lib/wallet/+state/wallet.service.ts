import { Injectable } from '@angular/core';

import { providers, getDefaultProvider, utils, Contract } from 'ethers';
import { toASCII } from 'punycode';
import { baseEnsDomain, network, factoryContract } from '@env';
import { Factory2 } from '@blockframes/contracts';
import { WalletStore } from './wallet.store';
import { KeyManagerService, KeyManagerQuery } from '../../key-manager/+state';
import { Relayer } from '../../relayer/relayer';

@Injectable({ providedIn: 'root' })
export class WalletService {

  provider: providers.Provider

  constructor(
    private keyManagerQuery: KeyManagerQuery,
    private store: WalletStore,
    private keyManager: KeyManagerService,
    private relayer: Relayer,
  ) {}

  public async updateFromEmail(email: string) {
    this.store.setLoading(true);
    const ensDomain = this.emailToEnsDomain(email);
    const address = await this.retreiveAddress(ensDomain);
    this.addBalanceListener(address);
    this.store.update({ensDomain, address});
    this.store.setLoading(false);
  }

  /**
   * Convert email to username and sanitize it:
   * convert to lower case punycode and replace special chars by their ASCII code
   * then add base ens domain
   * @example `漢micHel+9@exemple.com` -> `xn--michel439-2c2s.blockframes.eth`
   */
  public emailToEnsDomain(email: string) {
    return toASCII(email.split('@')[0]).toLowerCase()
      .split('')
      .map(char => /[^\w\d-.]/g.test(char) ? char.charCodeAt(0) : char) // replace every non a-z or 0-9 chars by their ASCII code : '?' -> '63'
      .join('') + '.' + baseEnsDomain;
  }

  /**
   * Get address of the given ENS domain, if this ENS domain doesn't exist
   * (i.e. the ERC1077 is not yet deployed) we precompute the address with CREATE2
   * @param ensDomain the full ENS domain : `alice.blockframes.eth`
   */
  public async retreiveAddress(ensDomain: string) {
    this._requireProvider();
    const address = await this.provider.resolveName(ensDomain);
    if(!!address){
      this.store.update({hasERC1077: true});
      return address;
    }
    return await this.precomputeAddress(ensDomain);
  }

  /**
   * This function precompute a contract address as defined in the EIP 1014 (Skinny Create 2)
   * @param ensDomain this is use as a salt (salt need to be unique for each user)
   * @param publicKey this is used in the smart-contract constructor argument
   */
  public async precomputeAddress(ensDomain: string) {
    this._requireProvider();

    const factoryAddress = await this.provider.resolveName(factoryContract);

    // retreive init code
    const factory2 = new Contract(factoryAddress, Factory2.abi, this.provider);
    const initCode = await factory2.getInitCode();

    // CREATE2 address
    let payload = '0xff';
    payload += factoryAddress.substr(2);
    payload += utils.keccak256(utils.toUtf8Bytes(ensDomain.split('.')[0])).substr(2); // salt
    payload += utils.keccak256(initCode).substr(2);
    return `0x${utils.keccak256(payload).slice(-40)}`;
  }

  private _requireProvider() {
    if(!this.provider) {
      this.provider = getDefaultProvider(network);
    }
  }

  public addBalanceListener(address: string){
    this._requireProvider();
    this.provider.on(address, (newBalance: utils.BigNumber) => this.store.update({balance: utils.formatEther(newBalance)}));
  }

  public cleanWallet() {
    delete this.provider;
  }

  public async createRandomKeyFromEmail(email: string, password?: string) {
    const ensDomain = this.emailToEnsDomain(email);
    return await this.keyManager.createFromRandom(ensDomain, password);
  }

  public async deployERC1077(ensDomain: string) {
    // TODO check if not already deployed
    let key = null;
    try{
      key = this.keyManagerQuery.getMainKeyOfUser(ensDomain).address;
    } catch(error) {
      throw new Error('You are trying to deploy an ERC1077 without any key');
    }
    return this.relayer.create(ensDomain.split('.')[0], key, await this.precomputeAddress(ensDomain));
  }
}
