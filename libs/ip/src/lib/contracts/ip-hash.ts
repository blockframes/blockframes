import { environment } from '@env/environment';
import { Injectable } from '@angular/core';
import { NgContract, INgContract, NgWallet } from '@blockframes/ethers';
import { Contract, providers } from 'ethers';

export interface IpHash extends INgContract {
  scriptsOwner(hash: string): Promise<string>;
  scriptsFrom(address: string): Promise<string[]>;
  addIp(hash: string): Promise<any>;
};

export const abi = [
  'function scriptsOwner(bytes32) public returns(address)',
  'function addIp(bytes32 _hash)',
  'function scriptsFrom(address _owner) public returns (bytes32[])',
  'event Timestamp(bytes32 indexed scriptHash, address indexed owner)'
];

@Injectable({ providedIn: 'root' })
export class IpHashContract extends NgContract<IpHash> {
  constructor(wallet: NgWallet) {
    super('scriptHash', abi, wallet)
  }
}

export class IpHashContractReadOnly extends Contract {
  static NAME = 'IpHash';

  constructor(provider: providers.BaseProvider) {
    const address = environment.contracts[IpHashContractReadOnly.NAME];
    super(address, abi, provider);
  }
}
