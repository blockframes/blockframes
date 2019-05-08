import { contracts } from '@env';
import { Injectable } from '@angular/core';
import { INgContract, RelayerWallet } from '@blockframes/ethers';
import { Contract, providers, ethers } from 'ethers';

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
export class IpHashContract extends ethers.Contract {
  constructor(wallet: RelayerWallet) {
    super('ipHash', abi, wallet)
  }
}

export class IpHashContractReadOnly extends Contract {
  static NAME = 'IpHash';

  constructor(provider: providers.BaseProvider) {
    const address = contracts[IpHashContractReadOnly.NAME];
    super(address, abi, provider);
  }
}
