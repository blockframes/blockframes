import { Injectable } from '@angular/core';

import { providers, getDefaultProvider, utils, Contract, Wallet as EthersWallet } from 'ethers';
import { toASCII } from 'punycode';
import { baseEnsDomain, network, factoryContract } from '@env';
import { ERC1077 } from '@blockframes/contracts';
import { WalletStore } from './wallet.store';
import { KeyManagerService, Key } from '../../key-manager/+state';
import { Relayer } from '../../relayer/relayer';
import { MetaTx, SignedMetaTx, LocalTx } from '../../types';
import { WalletQuery } from './wallet.query';
import { createDeleteKeyTx, createAddKeyTx } from './wallet-known-tx';

@Injectable({ providedIn: 'root' })
export class WalletService {

  provider: providers.Provider

  constructor(
    private query: WalletQuery,
    private store: WalletStore,
    private keyManager: KeyManagerService,
    private relayer: Relayer,
  ) {}

  public async updateFromEmail(email: string) {
    const ensDomain = this.emailToEnsDomain(email);
    const address = await this.retreiveAddress(ensDomain);
    this.store.update({ensDomain, address});
  }

  /**
   * Convert email to username and sanitize it:
   * convert to lower case punycode and replace special chars by their ASCII code
   * then add base ens domain
   * @example `漢micHel+9@exemple.com` -> `xn--michel439-2c2s.blockframes.eth`
   */
  // TODO issue#714 (Laurent work on a way to get those functions in only one place)
  public emailToEnsDomain(email: string) { // !!!! there is a copy of this function in 'apps/backend-functions/src/relayer.ts'
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
    if (!!address){
      const code = await this.provider.getCode(ensDomain);
      if (code !== '0x') {
        this.store.update({hasERC1077: true});
        return address;
      }
    }
    return await this.precomputeAddress(ensDomain);
  }

  /**
   * This function precompute a contract address as defined in the EIP 1014 (Skinny Create 2)
   * @param ensDomain this is use as a salt (salt need to be unique for each user)
   * @param publicKey this is used in the smart-contract constructor argument
   */
  // TODO issue#714 (Laurent work on a way to get those functions in only one place)
  public async precomputeAddress(ensDomain: string) { // !!!! there is a copy of this function in 'apps/backend-functions/src/relayer.ts'
    this._requireProvider();

    const factoryAddress = await this.provider.resolveName(factoryContract);

    // CREATE2 address
    let payload = '0xff';
    payload += factoryAddress.substr(2);
    payload += utils.keccak256(utils.toUtf8Bytes(this.getNameFromENS(ensDomain))).substr(2); // salt
    payload += utils.keccak256(`0x${ERC1077.bytecode}`).substr(2);
    return `0x${utils.keccak256(payload).slice(-40)}`;
  }

  private _requireProvider() {
    if(!this.provider) {
      this.provider = getDefaultProvider(network);
    }
  }

  public async createRandomKeyFromEmail(keyName: string, email: string, password?: string) {
    const ensDomain = this.emailToEnsDomain(email);
    const key = await this.keyManager.createFromRandom(keyName, ensDomain, password);
    this.keyManager.storeKey(key);
    return key;
  }

  /** Get first part of an ens domain : `alice.blockframes.eth` -> `alice` */
  public getNameFromENS(ensDomain: string) {
    return ensDomain.split('.')[0];
  }

  public async deployERC1077(ensDomain: string, pubKey: string) {
    if (this.query.getValue().hasERC1077) {
      throw new Error('Your smart-wallet is already deployed');
    }
    this.store.setLoading(true);
    try {
      const name =  this.getNameFromENS(ensDomain);
      const erc1077Address = await this.precomputeAddress(ensDomain);
      const result = await this.relayer.deploy(name, pubKey, erc1077Address);
      this.relayer.registerENSName(name, erc1077Address); // do not wait for ens register, this can be done in the background
      this.store.update({hasERC1077: true})
      this.store.setLoading(false);
      return result;
    } catch(err) {
      this.store.setLoading(false);
      console.error(err);
      throw new Error('Deploy seems to have failed, but firebase function is maybe still runing');
    }
  }

  /** return an instance of an ERC10777 contract */
  private getUsersERC1077(ensDomainOrAddress: string) {
    this._requireProvider();
    return new Contract(ensDomainOrAddress, ERC1077.abi, this.provider);
  }

  public async setDeleteKeyTx(erc1077Address: string, key: Key) {
    this.setTx(createDeleteKeyTx(erc1077Address, key.address, () => this.keyManager.deleteKey(key)));
  }

  public async setLinkKeyTx(erc1077Address: string, key: Key) {
    this.setTx(createAddKeyTx(erc1077Address, key.address, () => this.keyManager.storeKey({...key, isLinked: true})));
  }

  public setTx(tx: LocalTx) {
    this.store.update({tx});
  }

  private hashMetaTx(from: string, metaTx: MetaTx) {
    return this.getUsersERC1077(from).calculateMessageHash(
      from, metaTx.to, metaTx.value, metaTx.data, metaTx.nonce, // tx
      metaTx.gasPrice, metaTx.gasToken, metaTx.gasLimit, // gas
      metaTx.operationType // op type
    );
  }

  private signedMetaTxToData(signedMetaTx: SignedMetaTx) {
    const abiCoder = new utils.AbiCoder();
    return abiCoder.encode([
      'address', // to
      'uint256', // value
      'bytes', // data
      'uint256', // nonce
      'uint256', // gasPrice
      'address', // address
      'uint256', // gasLimit
      'uint8', // operationType
      'bytes', // signatures
    ],[
      signedMetaTx.to, signedMetaTx.value, signedMetaTx.data, signedMetaTx.nonce, // tx
      signedMetaTx.gasPrice, signedMetaTx.gasToken, signedMetaTx.gasLimit, // gas
      signedMetaTx.operationType, // op type
      signedMetaTx.signatures, // signature
    ]);
  }

  public async prepareMetaTx(wallet: EthersWallet): Promise<SignedMetaTx> {
    this._requireProvider();
    const from = this.query.getValue().address;
    const erc1077 = this.getUsersERC1077(from);

    // prepare
    const metaTx = {
      ...this.query.getValue().tx,
      nonce: await erc1077.getLastNonce(),
      gasPrice: await this.provider.getGasPrice().then(bigNum => bigNum.toHexString()),
      gasLimit: '0x0', // temporary gas limit
      gasToken: '0x0000000000000000000000000000000000000000', // zero address means ether instead of erc20
      operationType: '0x0', // required but not used in the contract yet
    }

    // estimate gas
    const mockTxHash = await this.hashMetaTx(from, metaTx);
    const mockSignature = await wallet.signMessage(mockTxHash);
    const mockSignedMetaTx: SignedMetaTx = {...metaTx, signatures: mockSignature};
    const mockTx: providers.TransactionRequest = {
      to: from,
      value: 0,
      data: this.signedMetaTxToData(mockSignedMetaTx),
    }
    const estimatedGasLimit = await this.provider.estimateGas(mockTx).then(bigNum => bigNum.toHexString());

    // hash & sign
    metaTx.gasLimit = estimatedGasLimit; // replace temporary gasLimit by its estimation
    const txHash = await this.hashMetaTx(from, metaTx);
    const signature = await wallet.signMessage(utils.arrayify(txHash));
    return {...metaTx, signatures: signature};
  }

  public async sendSignedMetaTx(ensDomain: string, signedMetaTx: SignedMetaTx, ...args: any[]) {
    const txReceipt = await this.relayer.send(await this.retreiveAddress(this.getNameFromENS(ensDomain)), signedMetaTx);
    if (txReceipt.status === 0) {
      throw new Error(`The transaction ${txReceipt.transactionHash} has failed !`);
    }
    this.query.getValue().tx.callback(...args); // execute tx callback (ex: delete local key)
    return txReceipt;
  }

  public async waitForTx(txHash: string) {
    this._requireProvider();
    console.log('wait for :', txHash);
    return this.provider.waitForTransaction(txHash);
  }
}
