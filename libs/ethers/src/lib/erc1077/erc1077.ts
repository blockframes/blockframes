// Ethers
import { ethers, Contract, Wallet } from 'ethers';
import { TransactionRequest } from 'ethers/providers';

// Internal
import { MetaTransaction } from './meta-transaction';
import { ERC1077_ABI } from './constants';
import { network, contracts, baseEnsDomain } from '@env';
import { RelayerWallet } from '../relayer-wallet/relayer-wallet';

export class ERC1077 extends Contract {
  constructor(public username: string, wallet: RelayerWallet) {
    super(`${username}.${baseEnsDomain}`, ERC1077_ABI, wallet);
  }

  /** Calculate the hash of a MetaTransaction */
  private async calculateHash(tx: Partial<MetaTransaction>): Promise<string> {
    return this.functions.calculateMessageHash(
      tx.from,
      tx.to,
      tx.value,
      tx.data,
      tx.nonce,
      tx.gasPrice,
      tx.gasToken,
      tx.gasLimit,
      tx.operationType
    );
  }

  /** Check if the relayer can send this tx */
  private async check(tx: Partial<MetaTransaction>): Promise<boolean> {
    return this.functions.canExecute(
      tx.to,
      tx.value,
      tx.data,
      tx.nonce,
      tx.gasPrice,
      tx.gasToken,
      tx.gasLimit,
      tx.operationType,
      tx.signatures
    );
  }

  /** Build and forward the tx to the relayer wallet */
  public async send(transaction: Partial<MetaTransaction>) {
    const { to, from, data, value } = transaction;
    try {
      const [gasLimit, gasPrice, nonce] = await Promise.all([
        this.provider.estimateGas({ to, from, data, value }),
        this.provider.getGasPrice(),
        this.functions.lastNonce()
      ]);
      const tx: Partial<MetaTransaction> = {
        ...transaction,
        gasLimit,
        gasPrice,
        nonce,
        from: this.address,
        gasToken: '0x0000000000000000000000000000000000000000', // Ether as refund token
        operationType: ethers.utils.bigNumberify(0)
      };
      const hash = await this.calculateHash(tx);
      const signatures = await this.signer.signMessage(ethers.utils.arrayify(hash));
      const signedTx = { ...tx, hash, signatures } as MetaTransaction;

      const ok = await this.check(signedTx);
      if (!ok) {
        throw new Error(
          'The execution of the meta-transaction will fail ! This is probably a problem with the signature, or the within transaction.'
        );
      }

      return this.functions.executeSigned(
        signedTx.to,
        signedTx.value,
        signedTx.data,
        signedTx.nonce,
        signedTx.gasPrice,
        signedTx.gasToken,
        signedTx.gasLimit,
        signedTx.operationType,
        signedTx.signatures
      );
    } catch (err) {
      throw new Error(err);
    }
  }
}
