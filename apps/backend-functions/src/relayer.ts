import { SignedMetaTx } from "@blockframes/ethers/types";
import { getProvider } from "@blockframes/ethers/helpers";

import { Wallet } from '@ethersproject/wallet';
import { Contract, ContractFactory } from '@ethersproject/contracts';
import { TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider';
import { namehash } from '@ethersproject/hash';
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { getAddress } from '@ethersproject/address';
import { abi as CREATE2_FACTORY_ABI } from '@blockframes/contracts/Factory2.json';
import { bytecode as ERC1077_BYTECODE, abi as ERC1077_ABI } from '@blockframes/contracts/ERC1077.json';
import { abi as ENS_REGISTRY_ABI } from '@blockframes/contracts/ENSRegistry.json';
import { abi as ENS_RESOLVER_ABI } from '@blockframes/contracts/PublicResolver.json';
import {abi as ORG_CONTRACT_ABI, bytecode as ORG_CONTRACT_BYTECODE } from '@blockframes/contracts/Organization.json';

type TxResponse = TransactionResponse;
type TxReceipt = TransactionReceipt;

export interface Relayer {
  wallet: Wallet;
  contractFactory: Contract;
  baseEnsDomain: string;
  namehash: string;
  registry: Contract;
  resolver: Contract;
}

export interface RelayerConfig {
  mnemonic: string;
  network: string;
  baseEnsDomain: string;
  registryAddress: string;
  resolverAddress: string;
  factoryContract: string;
}

export interface SendParams {
  ethAddress: string;
  tx: SignedMetaTx;
}

export interface RequestTokensParams {
  username: string;
  amount: number;
}

export interface SignDeliveryParams {
  username: string;
  deliveryId: string;
  stakeholderId: string;
}
interface DeployParams {
  username: string;
  key: string;
  orgAddress: string;
  erc1077address: string;
}

interface RegisterParams {
  name: string;
  ethAddress: string;
}

export function initRelayer(config: RelayerConfig): Relayer {

  const {
    mnemonic,
    network,
    factoryContract,
    baseEnsDomain,
    registryAddress,
    resolverAddress
  } = config;

  const provider = getProvider(network);

  const wallet = Wallet.fromMnemonic(mnemonic).connect(provider);

  const contractFactory = new Contract(factoryContract, CREATE2_FACTORY_ABI, wallet);
  const relayerNamehash = namehash(baseEnsDomain);
  const registry = new Contract(registryAddress, ENS_REGISTRY_ABI, wallet);
  const resolver = new Contract(resolverAddress, ENS_RESOLVER_ABI, wallet);

  return <Relayer>{
    wallet,
    contractFactory,
    baseEnsDomain,
    namehash: relayerNamehash,
    registry,
    resolver,
  };
}

/** check if an ENS name is linked to an eth address */
export async function isENSNameRegistered(ensName: string, config: RelayerConfig) {
  const relayer = initRelayer(config);

  const address = await relayer.wallet.provider.resolveName(ensName); // return eth address or null
  return !!address;
}

//---------------------------------------------------
//                   DEPLOY
//---------------------------------------------------

export async function relayerDeployLogic(
  { username, key, orgAddress, erc1077address }: DeployParams,
  config: RelayerConfig
) {
  const relayer: Relayer = initRelayer(config);

  // check required params
  if (!username || !key || !orgAddress || !erc1077address) {
    throw new Error('"username", "key", "erc1077address", and "orgAddress" are mandatory parameters !');
  }

  try {
    getAddress(key);
    getAddress(orgAddress);
    getAddress(erc1077address);
  } catch (error) {
    throw new Error('"key", "orgAddress" and/or "erc1077address" should be a valid ethereum address !');
  }

  // compute needed values
  const hash = keccak256(toUtf8Bytes(username));

  const result: Record<string, TxReceipt> = {};
  const codeAtAddress = await relayer.wallet.provider.getCode(erc1077address);
  if (codeAtAddress === '0x') { // if there is already some code at this address : skip deploy

    try {
      const deployTx: TxResponse = await relayer.contractFactory.deploy(
        hash,
        `0x${ERC1077_BYTECODE}`,
        key.toLowerCase(),
        orgAddress.toLowerCase(),
      );
      try {
        result['deploy'] = await deployTx.wait();
      } catch(error) {
        // do nothing, there is a bug in ethers, catch is expected here
      }
      console.log(`(D) tx sent (deploy) : ${deployTx.hash}`);
    } catch (error) {
      console.error('Transaction failed to be broadcasted or execution reverted', error);
      throw new Error(error);
    }
  }

  const ensResult = await relayerRegisterENSLogic({name: username, ethAddress: erc1077address}, config);

  return {...result, ...ensResult};
};

//---------------------------------------------------
//                   REGISTER
//---------------------------------------------------

export async function relayerRegisterENSLogic(
  { name, ethAddress }: RegisterParams,
  config: RelayerConfig
) {
  const relayer: Relayer = initRelayer(config);

  // check required params
  if (!name || !ethAddress) {
    throw new Error('"name" and "ethAddress" are mandatory parameters !');
  }

  try {
    getAddress(ethAddress);
  } catch (error) {
    throw new Error('"ethAddress" should be a valid ethereum address !');
  }

  // in case name is of the form `name.blockframes.eth` we only want the first part to prevent ending with `name.blockframes.eth.blockframes.eth`
  const [labelName] = name.split('.');

  // compute needed values
  const fullName = `${labelName}.${config.baseEnsDomain}`;
  const hash = keccak256(toUtf8Bytes(labelName));

  try {
    /*
    ENS registration require 3 interdependent txs to happens :
    here are the order of the tx and their dependencies

       (A) --> (B) --> (C)     // ENS workflow, (A) must complete before (B)

    */

    const ZERO_ADDRESS = '0x00000000000000000000000000000000000000';

    const retrievedAddress = await relayer.wallet.provider.resolveName(fullName);
    if (!!retrievedAddress && retrievedAddress !== ZERO_ADDRESS) { // if name is already link to a non-zero address : skip
      throw new Error(`${fullName} already linked to an address (${retrievedAddress})`);
    }
    const result: Record<string, TxReceipt> = {};

    // (A) register the user ens username
    const nameOwner = await relayer.registry.owner(namehash(fullName));
    if (nameOwner !== relayer.wallet.address) { // if name is already registered : skip registration
      const registerTx: TxResponse = await relayer.registry.setSubnodeOwner(
        relayer.namehash,
        hash,
        relayer.wallet.address,
      );
      result['register'] = await registerTx.wait();
      console.log(`(A) tx sent (register) : ${registerTx.hash}`); // display tx to firebase logging
    }

    // (B) set a resolver to the ens username : require waiting for (A)
    const resolverAddress = await relayer.registry.resolver(namehash(fullName))
    if (resolverAddress !== relayer.resolver.address) { // if a resolver is already set : skip set resolver
      const resolverTx: TxResponse = await relayer.registry.setResolver(
        namehash(fullName),
        relayer.resolver.address,
      );
      result['resolver']= await resolverTx.wait();
      console.log(`(B) tx sent (setResolver) : ${resolverTx.hash}`); // display tx to firebase logging
    }

    // (C) link the erc1077 to the ens username : require waiting for (B)
    const linkTx: TxResponse = await relayer.resolver.setAddr(
      namehash(fullName),
      ethAddress,
    )
    result['link'] = await linkTx.wait();
    console.log(`(C) tx sent (setAddress) : ${linkTx.hash}`); // display tx to firebase logging
    ;
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};



//---------------------------------------------------
//                   SEND
//---------------------------------------------------

export async function relayerSendLogic(
  { ethAddress, tx }: SendParams,
  config: RelayerConfig
) {
  const relayer: Relayer = initRelayer(config);
  // check required params
  if (!ethAddress || !tx) {
    throw new Error('"ethAddress" and "tx" are mandatory parameters !');
  }

  try {
    getAddress(ethAddress);
  } catch (error) {
    throw new Error('"ethAddress" should be a valid ethereum address !');
  }

  // compute needed values
  const erc1077 = new Contract(ethAddress, ERC1077_ABI, relayer.wallet);

  // check if tx will be accepted by erc1077
  const canExecute: boolean = await erc1077.functions.canExecute(
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

  if (!canExecute) {
    console.log(tx);
    throw new Error(
      'The transaction has not been sent because it will be be rejected by the ERC1077, this is probably a nonce or signatures problem.'
    );
  }

  const sendTx = await erc1077.functions.executeSigned(
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
  console.log(`tx sent (executeSigned) : ${sendTx.hash}`); // display tx to firebase logging

  const txReceipt = await sendTx.wait();
  return txReceipt;
};

//---------------------------------------------------
//               DEPLOY ORG CONTRACT
//---------------------------------------------------

export async function relayerDeployOrganizationLogic(
  adminAddress: string,
  config: RelayerConfig
) {
  const relayer: Relayer = initRelayer(config);
  // check required params
  if (!adminAddress) {
    throw new Error('"adminAddress" is a mandatory parameters !');
  }

  try {
    getAddress(adminAddress);
  } catch (error) {
    throw new Error('"adminAddress" should be a valid ethereum address !');
  }

  const organizationFactory = new ContractFactory(ORG_CONTRACT_ABI, ORG_CONTRACT_BYTECODE, relayer.wallet);
  const contract = await organizationFactory.deploy(adminAddress);
  console.log(`tx sent (deployOrganization) : ${contract.deployTransaction.hash}`); // display tx to firebase logging
  await contract.deployed();
  return contract.address;
}
