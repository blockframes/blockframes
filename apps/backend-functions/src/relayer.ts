import {
  InfuraProvider,
  EtherscanProvider,
  FallbackProvider,
  NodesmithProvider
} from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Contract, ContractFactory } from '@ethersproject/contracts';
import { TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider';
import { namehash } from '@ethersproject/hash';
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { getAddress } from '@ethersproject/address';
import { toASCII } from 'punycode';
import { abi as CREATE2_FACTORY_ABI } from './contracts/Factory2.json';
import { bytecode as ERC1077_BYTECODE, abi as ERC1077_ABI } from './contracts/ERC1077.json';
import { abi as ENS_REGISTRY_ABI } from './contracts/ENSRegistry.json';
import { abi as ENS_RESOLVER_ABI } from './contracts/PublicResolver.json';
import {abi as ORG_CONTRACT_ABI, bytecode as ORG_CONTRACT_BYTECODE } from './contracts/Organization.json';
import { db } from './internals/firebase';

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

/** Regular Ethereum transaction */
export interface BaseTx {
  to: string; // address
  value: string; // uint256
  data: string; // bytes
}

/** A Meta Transaction that encapsulate a regular tx (it will need a signatures before being sent)*/
export interface MetaTx extends BaseTx {
  nonce: string; // uint256
  gasPrice: string; // uint256
  gasToken: string; // address
  gasLimit: string; // uint256
  operationType: string; // uint8
}

/** A Meta Transaction with the user signature (ready to be sent) */
export interface SignedMetaTx extends MetaTx {
  signatures: string; // bytes
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

export function initRelayer(config: RelayerConfig): Relayer {
  let wallet = Wallet.fromMnemonic(config.mnemonic);

  const infura = new InfuraProvider(config.network);
  const etherscan = new EtherscanProvider(config.network);
  const nodesmith = new NodesmithProvider(config.network);

  const provider = new FallbackProvider([infura, etherscan, nodesmith], 1);

  wallet = wallet.connect(provider);

  const contractFactory = new Contract(config.factoryContract, CREATE2_FACTORY_ABI, wallet);
  const baseEnsDomain = config.baseEnsDomain;
  const relayerNamehash = namehash(config.baseEnsDomain);
  const registry = new Contract(config.registryAddress, ENS_REGISTRY_ABI, wallet);
  const resolver = new Contract(config.resolverAddress, ENS_RESOLVER_ABI, wallet);

  return <Relayer>{
    wallet,
    contractFactory,
    baseEnsDomain,
    namehash: relayerNamehash,
    registry,
    resolver,
  };
}

interface DeployParams {
  username: string;
  key: string;
  erc1077address: string;
  orgId: string;
}

interface RegisterParams {
  name: string;
  ethAddress: string;
}

// TODO issue#714 (Laurent work on a way to get those functions in only one place)
export function emailToEnsDomain(email: string, baseEnsDomain: string) { // !!!! there is a copy of this function in 'libs\ethers\src\lib\helpers.ts'
  return toASCII(email.split('@')[0]).toLowerCase()
    .split('')
    .map(char => /[^\w\d-.]/g.test(char) ? char.charCodeAt(0) : char) // replace every non a-z or 0-9 chars by their ASCII code : '?' -> '63'
    .join('') + '.' + baseEnsDomain;
}

/**
 * This function precompute a contract address as defined in the EIP 1014 (Skinny Create 2)
 * @param ensDomain this is use as a salt (salt need to be unique for each user)
 * @param provider ethers provider
 */
// TODO issue#714 (Laurent work on a way to get those functions in only one place)
export async function precomputeAddress(ensDomain: string, config: RelayerConfig) { // !!!! there is a copy of this function in 'libs\ethers\src\lib\helpers.ts'
  const baseName = ensDomain.split('.')[0];
  const relayer = initRelayer(config);
  const factoryAddress = await relayer.wallet.provider.resolveName(relayer.contractFactory.address).then(address => address.substr(2));
  const salt = keccak256(toUtf8Bytes(baseName)).substr(2);
  const byteCodeHash = keccak256(`0x${ERC1077_BYTECODE}`).substr(2);

  const payload = `0xff${factoryAddress}${salt}${byteCodeHash}`;

  return `0x${keccak256(payload).slice(-40)}`; // first 40 bytes of the hash of the payload
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
  { username, key, erc1077address, orgId }: DeployParams,
  config: RelayerConfig
) {
  const relayer: Relayer = initRelayer(config);

  // check required params
  if (!username || !key || !erc1077address || !orgId) {
    throw new Error('"username", "key", "erc1077address", and "orgAddress" are mandatory parameters !');
  }

  try {
    getAddress(key);
    getAddress(erc1077address);
  } catch (error) {
    throw new Error('"key" and/or "erc1077address" should be a valid ethereum address !');
  }

  // compute needed values
  const hash = keccak256(toUtf8Bytes(username));
  const orgName = await db.doc(`/orgs/${orgId}`).get().then(org => org.get('name')) as string;
  const orgEns = emailToEnsDomain(orgName.replace(' ', '-'), relayer.baseEnsDomain);
  const orgAddress = await relayer.wallet.provider.resolveName(orgEns);

  try {

    const result: Record<string, TxReceipt> = {};

    const codeAtAddress = await relayer.wallet.provider.getCode(erc1077address);
    if (codeAtAddress === '0x') { // if there is already some code at this address : skip deploy
      const deployTx: TxResponse = await relayer.contractFactory.deploy(
        hash,
        `0x${ERC1077_BYTECODE}`,
        key.toLocaleLowerCase(),
        orgAddress.toLocaleLowerCase(),
      )

      result['deploy'] = await deployTx.wait();
      console.log(`(D) tx sent (deploy) : ${deployTx.hash}`);
    }

    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
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
