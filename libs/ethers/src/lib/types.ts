import { ContractFunction } from 'ethers';

export interface INgContract {
  [methods: string]: ContractFunction;
}

export interface Addresses {
  mainnet?: string;
  ropsten?: string;
  kovan?: string;
  rinkeby?: string;
  local?: string;