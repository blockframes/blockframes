import { NgWallet } from "./wallet/+state";
import { Contract } from "ethers";

const ABI = []


export class ERC1077 extends Contract {
    constructor(username: string, wallet: NgWallet) {
        super(username, ABI, wallet)
    }
    // TODO helpers
}