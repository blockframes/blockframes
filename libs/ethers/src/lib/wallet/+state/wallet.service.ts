import { Injectable } from '@angular/core';
import { network } from '@env';
import { ERC1077 } from '@blockframes/contracts';
import { WalletStore } from './wallet.store';
import { KeyManagerService, KeyManagerQuery } from '../../key-manager/+state';
import { Relayer } from '../../relayer/relayer';
import { MetaTx, SignedMetaTx, ActionTx, TxFeedback } from '../../types';
import { WalletQuery } from './wallet.query';
import { emailToEnsDomain, precomputeAddress, getNameFromENS, Key } from '@blockframes/utils';
import { CreateTx } from '../../create-tx';

// Ethers
import { arrayify } from '@ethersproject/bytes';
import { AbiCoder } from '@ethersproject/abi';
import {
  TransactionRequest,
  EtherscanProvider,
  FallbackProvider,
  InfuraProvider,
  NodesmithProvider
} from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Wallet as EthersWallet } from '@ethersproject/wallet';

@Injectable({ providedIn: 'root' })
export class WalletService {

  provider: FallbackProvider;

  constructor(
    private query: WalletQuery,
    private store: WalletStore,
    private keyManager: KeyManagerService,
    private keyQuery: KeyManagerQuery,
    private relayer: Relayer,
  ) {}

  public async updateFromEmail(email: string) {
    const ensDomain = emailToEnsDomain(email);
    const address = await this.retrieveAddress(ensDomain);
    this.store.update({ensDomain, address});
  }

  /**
   * Get address of the given ENS domain, if this ENS domain doesn't exist
   * (i.e. the ERC1077 is not yet deployed) we precompute the address with CREATE2
   * @param ensDomain the full ENS domain : `alice.blockframes.eth`
   */
  public async retrieveAddress(ensDomain: string) {
    this._requireProvider();
    const address = await this.provider.resolveName(ensDomain);
    if (!!address){
      const code = await this.provider.getCode(ensDomain);
      if (code !== '0x') {
        this.store.update({hasERC1077: true});
        return address;
      }
    }
    return precomputeAddress(ensDomain, this.provider);
  }



  private _requireProvider() {
    if(!this.provider) {
      const infura = new InfuraProvider(network);
      const etherscan = new EtherscanProvider(network);
      const nodesmith = new NodesmithProvider(network);

      this.provider = new FallbackProvider([infura, etherscan, nodesmith], 1);
    }
  }

  public async createRandomKeyFromEmail(keyName: string, email: string, password?: string) {
    const ensDomain = emailToEnsDomain(email);
    const key = await this.keyManager.createFromRandom(keyName, ensDomain, password);
    this.keyManager.storeKey(key);
    return key;
  }

  /**
   * Ask the relayer to deploy the user's smart-wallet
   * @param ensDomain the ens of the user : `alice.blockframes.eth`
   * @param pubKey the address of the first key to put in the smart-wallet
   * @param orgId the id of the user's org, it will be used to put the org address as the recover address
   */
  public async deployERC1077(ensDomain: string, pubKey: string, orgId: string) {
    this._requireProvider();
    if (this.query.getValue().hasERC1077) {
      throw new Error('Your smart-wallet is already deployed');
    }
    this.store.setLoading(true);
    try {
      const name =  getNameFromENS(ensDomain);
      const erc1077Address = await precomputeAddress(ensDomain, this.provider);
      const result = await this.relayer.deploy(name, pubKey, erc1077Address, orgId);
      this.relayer.registerENSName(name, erc1077Address); // do not wait for ens register, this can be done in the background
      this.store.update({hasERC1077: true})
      this.store.setLoading(false);
      return result;
    } catch(err) {
      this.store.setLoading(false);
      console.error(err);
      throw new Error('Deploy seems to have failed, but firebase function is maybe still running');
    }
  }

  /** return an instance of an ERC10777 contract */
  private getUsersERC1077(ensDomainOrAddress: string) {
    this._requireProvider();
    return new Contract(ensDomainOrAddress, ERC1077.abi, this.provider);
  }

  public setDeleteKeyTx(erc1077Address: string, key: Key) {
    const tx = CreateTx.deleteKey(erc1077Address, key.address, () => this.keyManager.deleteKey(key));
    const feedback = {
      confirmation: 'You are about to delete a key from your smart-wallet',
      success: 'Your key has been successfully deleted !',
      redirectName: 'Back to Wallet',
      redirectRoute: '/layout/o/account/wallet',
    }
    this.setTx(tx);
    this.setTxFeedback(feedback);
  }

  public setLinkKeyTx(erc1077Address: string, key: Key) {
    const tx = CreateTx.addKey(erc1077Address, key.address, () => this.keyManager.storeKey({...key, isLinked: true}));
    const feedback = {
      confirmation: 'You are about add a new key to your smart-wallet',
      success: 'Your key has been successfully added !',
      redirectName: 'Back to Wallet',
      redirectRoute: '/layout/o/account/wallet',
    }
    this.setTx(tx);
    this.setTxFeedback(feedback);
  }

  public setTx(tx: ActionTx) {
    this.store.update({tx});
  }

  public setTxFeedback(feedback: TxFeedback) {
    this.store.update({feedback});
  }

  public deleteTxFeedback() {
    this.store.update({feedback: undefined});
  }

  private hashMetaTx(from: string, metaTx: MetaTx) {
    return this.getUsersERC1077(from).calculateMessageHash(
      from, metaTx.to, metaTx.value, metaTx.data, metaTx.nonce, // tx
      metaTx.gasPrice, metaTx.gasToken, metaTx.gasLimit, // gas
      metaTx.operationType // op type
    );
  }

  private signedMetaTxToData(signedMetaTx: SignedMetaTx) {
    const abiCoder = new AbiCoder();
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
    const mockTx: TransactionRequest = {
      to: from,
      value: 0,
      data: this.signedMetaTxToData(mockSignedMetaTx),
    }
    const estimatedGasLimit = await this.provider.estimateGas(mockTx).then(bigNum => bigNum.toHexString());

    // hash & sign
    metaTx.gasLimit = estimatedGasLimit; // replace temporary gasLimit by its estimation
    const txHash = await this.hashMetaTx(from, metaTx);
    const signature = await wallet.signMessage(arrayify(txHash));
    return {...metaTx, signatures: signature};
  }

  public async sendSignedMetaTx(ensDomain: string, signedMetaTx: SignedMetaTx, ...args: any[]) {
    const address = await this.retrieveAddress(getNameFromENS(ensDomain));
    try {
      const txReceipt = await this.relayer.send(address, signedMetaTx);

      if (txReceipt.status === 0) {
        throw new Error(`The transaction (${txReceipt.transactionHash}) has been sent but has failed to complete successfully !`);
      }

      const actionTx = this.query.getValue().tx;
      const hasCallback = !!actionTx.callback;
      if(hasCallback) {
        actionTx.callback(...args); // execute tx callback (ex: delete local key)
      }
      this.store.update({tx: null});
    } catch (error) {
      // store error and throw back to notice the component of the error
      this.handleError('Our relayer as encountered a problem, your transaction hasn\'t been sent. Please try again later. If the problem persist please contact an admin.');
      throw new Error(error);
    }
  }

  public async waitForTx(txHash: string) {
    this._requireProvider();
    console.log('wait for :', txHash);
    return this.provider.waitForTransaction(txHash);
  }

  public async checkWallet() {
    this._requireProvider();
    const ensDomain = this.query.getValue().ensDomain;
    const walletCode = await this.provider.getCode(ensDomain);
    if (walletCode === '0x') { // wallet has been destroyed or is not yet deployed
      const keys = [...this.keyQuery.getKeysOfUser(ensDomain)];
      keys.forEach(key => this.keyManager.deleteKey(key));
      throw new Error('self-destructed');
    }
  }

  /** Update the feedback message with the error */
  public handleError(error: string) {
    const txFeedback = this.query.getValue().feedback;
    this.store.update({
      feedback: {
        ...txFeedback,
        success: error
      }
    })
  }
}
