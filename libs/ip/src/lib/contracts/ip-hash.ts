import { contracts } from '@env';
import { Injectable } from '@angular/core';
import { INgContract } from '@blockframes/ethers';
import { Contract } from '@ethersproject/contracts';
import { FallbackProvider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';

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
export class IpHashContract extends Contract {
  constructor(signer: Signer) {
    super(contracts.ipHash, abi, signer)
  }
}

export class IpHashContractReadOnly extends Contract {
  static NAME = 'IpHash';

  constructor(provider: FallbackProvider) {
    const address = contracts[IpHashContractReadOnly.NAME];
    super(address, abi, provider);
  }
}
