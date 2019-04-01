import { BigNumber } from "ethers/utils";

export interface MetaTransaction {
    from: string,
    to: string,
    value: BigNumber,
    data: string,
    nonce: BigNumber,
    gasPrice: BigNumber,
    gasToken: string,
    gasLimit: BigNumber,
    operationType: BigNumber,
    signatures: string,
    hash: string,
}