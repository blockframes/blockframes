
// Angular
import { HttpClient } from "@angular/common/http";
import { switchMap, tap } from "rxjs/operators";

// Ethers
import { ethers, Contract, Wallet } from "ethers";
import { TransactionRequest, TransactionResponse } from "ethers/providers";

// Internal
import { MetaTransaction } from "./meta-transaction";
import { baseEnsDomain } from "@env";

const ERC1077_ABI = [{ constant: true, inputs: [], name: "lastNonce", outputs: [{ name: "", type: "uint256" }], payable: false, stateMutability: "view", type: "function" }, { constant: true, inputs: [{ name: "_key", type: "address" }, { name: "_purpose", type: "uint256" }], name: "keyHasPurpose", outputs: [{ name: "result", type: "bool" }], payable: false, stateMutability: "view", type: "function" }, { constant: true, inputs: [{ name: "", type: "address" }], name: "keys", outputs: [{ name: "purpose", type: "uint256" }, { name: "key", type: "address" }], payable: false, stateMutability: "view", type: "function" }, { constant: false, inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }, { name: "data", type: "bytes" }, { name: "nonce", type: "uint256" }, { name: "gasPrice", type: "uint256" }, { name: "gasToken", type: "address" }, { name: "gasLimit", type: "uint256" }, { name: "operationType", type: "uint8" }, { name: "signatures", type: "bytes" }], name: "executeSigned", outputs: [{ name: "", type: "bytes32" }], payable: false, stateMutability: "nonpayable", type: "function" }, { constant: true, inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "value", type: "uint256" }, { name: "data", type: "bytes" }, { name: "nonce", type: "uint256" }, { name: "gasPrice", type: "uint256" }, { name: "gasToken", type: "address" }, { name: "gasLimit", type: "uint256" }, { name: "operationType", type: "uint8" }], name: "calculateMessageHash", outputs: [{ name: "", type: "bytes32" }], payable: false, stateMutability: "pure", type: "function" }, { constant: true, inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "value", type: "uint256" }, { name: "data", type: "bytes" }, { name: "nonce", type: "uint256" }, { name: "gasPrice", type: "uint256" }, { name: "gasToken", type: "address" }, { name: "gasLimit", type: "uint256" }, { name: "operationType", type: "uint8" }, { name: "signatures", type: "bytes" }], name: "getSigner", outputs: [{ name: "", type: "address" }], payable: false, stateMutability: "pure", type: "function" }, { constant: false, inputs: [{ name: "_keys", type: "address[]" }, { name: "_purposes", type: "uint256[]" }], name: "addKeys", outputs: [{ name: "success", type: "bool" }], payable: false, stateMutability: "nonpayable", type: "function" }, { constant: false, inputs: [{ name: "_key", type: "address" }, { name: "_purpose", type: "uint256" }], name: "removeKey", outputs: [{ name: "success", type: "bool" }], payable: false, stateMutability: "nonpayable", type: "function" }, { constant: false, inputs: [{ name: "_key", type: "address" }, { name: "_purpose", type: "uint256" }], name: "addKey", outputs: [{ name: "success", type: "bool" }], payable: false, stateMutability: "nonpayable", type: "function" }, { constant: true, inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }, { name: "data", type: "bytes" }, { name: "nonce", type: "uint256" }, { name: "gasPrice", type: "uint256" }, { name: "gasToken", type: "address" }, { name: "gasLimit", type: "uint256" }, { name: "operationType", type: "uint8" }, { name: "signatures", type: "bytes" }], name: "canExecute", outputs: [{ name: "", type: "bool" }], payable: false, stateMutability: "view", type: "function" }, { constant: true, inputs: [{ name: "_key", type: "address" }], name: "keyExist", outputs: [{ name: "", type: "bool" }], payable: false, stateMutability: "view", type: "function" }, { constant: true, inputs: [{ name: "_key", type: "address" }], name: "getKeyPurpose", outputs: [{ name: "purpose", type: "uint256" }], payable: false, stateMutability: "view", type: "function" }, { constant: true, inputs: [], name: "keyCount", outputs: [{ name: "", type: "uint256" }], payable: false, stateMutability: "view", type: "function" }, { inputs: [{ name: "_key", type: "address" }], payable: false, stateMutability: "nonpayable", type: "constructor" }, { payable: true, stateMutability: "payable", type: "fallback" }, { anonymous: false, inputs: [{ indexed: true, name: "messageHash", type: "bytes32" }, { indexed: true, name: "nonce", type: "uint256" }, { indexed: true, name: "success", type: "bool" }], name: "ExecutedSigned", type: "event" }, { anonymous: false, inputs: [{ indexed: false, name: "count", type: "uint256" }], name: "MultipleKeysAdded", type: "event" }, { anonymous: false, inputs: [{ indexed: true, name: "key", type: "address" }, { indexed: true, name: "purpose", type: "uint256" }], name: "KeyAdded", type: "event" }, { anonymous: false, inputs: [{ indexed: true, name: "key", type: "address" }, { indexed: true, name: "purpose", type: "uint256" }], name: "KeyRemoved", type: "event" }];

function getMockTx(tx: Partial<MetaTransaction>): TransactionRequest {
    return {
        to: tx.to,
        from: tx.from,
        data: tx.data,
        value: tx.value
    }
}

// @Injectable({providedIn: 'root'})
export class ERC1077 extends Contract {

    constructor(
        public username: string,
        wallet: Wallet,
        private relayer: (tx: MetaTransaction) => Promise<Object>
    ) {
        super(`${username}.${baseEnsDomain}`, ERC1077_ABI, wallet);
    }

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
            tx.operationType,
        );
    }

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

    public async send(transaction: Partial<MetaTransaction>) {
        try {
            const [gasLimit, gasPrice, nonce] = await Promise.all([
                this.provider.estimateGas(getMockTx(transaction)),
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
            const hash = await this.calculateHash(tx)
            const signatures = await this.signer.signMessage(ethers.utils.arrayify(hash));
            const signedTx = { ...tx, hash, signatures } as MetaTransaction

            const ok = await this.check(signedTx)
            if (!ok) {
                throw new Error('The execution of the meta-transaction will fail ! This is probably a problem with the signature, or the within transaction.');
            }

            // ? injected function, is this the best way ?
            return this.relayer(signedTx);

        } catch (err) {
            throw new Error(err)
        }
    }
}