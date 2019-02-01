import { environment } from "@env/environment";
import { NgWallet } from "./wallet/+state";
import { Contract } from "ethers";
import { INgContract } from "./types";

/** A contract that is aware of its methods */
export class NgContract<T extends INgContract> extends Contract {
  functions: { [key in keyof T]: T[key] };
  constructor(name: string, abi: string[], wallet: NgWallet) {
    const address = environment.contracts[name]
    super(address, abi, wallet)
  }
}
