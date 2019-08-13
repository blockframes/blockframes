import { Wallet, Contract, utils, getDefaultProvider, providers, ContractFactory } from 'ethers';
import { toASCII } from 'punycode';
import * as CREATE2_FACTORY from './contracts/Factory2.json';
import * as ERC1077 from './contracts/ERC1077.json';
import * as ENS_REGISTRY from './contracts/ENSRegistry.json';
import * as ENS_RESOLVER from './contracts/PublicResolver.json';
import * as ORG_CONTRACT from './contracts/Organization.json';

type TxResponse = providers.TransactionResponse;
type TxReceipt = providers.TransactionReceipt;

export interface Relayer {
  wallet: Wallet;
  contractFactory: Contract;
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
  address: string;
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
  const provider = getDefaultProvider(config.network);
  wallet = wallet.connect(provider);
  const contractFactory = new Contract(config.factoryContract, CREATE2_FACTORY.abi, wallet);
  const namehash = utils.namehash(config.baseEnsDomain);
  const registry = new Contract(config.registryAddress, ENS_REGISTRY.abi, wallet);
  const resolver = new Contract(config.resolverAddress, ENS_RESOLVER.abi, wallet);

  return <Relayer>{
    wallet,
    contractFactory,
    namehash,
    registry,
    resolver,
  };
};

interface DeployParams {
  username: string;
  key: string;
  erc1077address: string;
};

interface RegisterParams {
  name: string;
  address: string;
}

// TODO issue#714 (Laurent work on a way to get those functions in only one place)
export function emailToEnsDomain(email: string, baseEnsDomain: string) { // !!!! there is a copy of this function in 'libs/ethers/wallet/wallet.service.ts'
  return toASCII(email.split('@')[0]).toLowerCase()
    .split('')
    .map(char => /[^\w\d-.]/g.test(char) ? char.charCodeAt(0) : char) // replace every non a-z or 0-9 chars by their ASCII code : '?' -> '63'
    .join('') + '.' + baseEnsDomain;
}
// TODO issue#714 (Laurent work on a way to get those functions in only one place)
export async function precomputeAddress(ensDomain: string, config: RelayerConfig) { // !!!! there is a copy of this function in 'libs/ethers/wallet/wallet.service.ts'
  const relayer = initRelayer(config);
  const factoryAddress = await relayer.wallet.provider.resolveName(relayer.contractFactory.address);
  ensDomain = ensDomain.split('.')[0];
  // CREATE2 address
  let payload = '0xff';
  payload += factoryAddress.substr(2);
  payload += utils.keccak256(utils.toUtf8Bytes(ensDomain)).substr(2); // salt
  payload += utils.keccak256(`0x${ERC1077.bytecode}`).substr(2);
  return `0x${utils.keccak256(payload).slice(-40)}`;
}

/** check if an ENS name is linked to an eth address */
export async function isENSNameRegistred(ensName: string, config: RelayerConfig) {
  const relayer = initRelayer(config);

  const address = await relayer.wallet.provider.resolveName(ensName); // return eth address or null
  return !!address;
}

//---------------------------------------------------
//                   DEPLOY
//---------------------------------------------------

export async function relayerDeployLogic(
  { username, key, erc1077address }: DeployParams,
  config: RelayerConfig
) {
  const relayer: Relayer = initRelayer(config);

  const recoverAddress = '0x4D7e2f3ab055FC5d484d15aD744310dE98dD5Bc3'; // TODO this will be the org address in the future, pass this as a function params : issue #654

  // check required params
  if (!username || !key || !erc1077address) {
    throw new Error('"username", "key" and "erc1077address" are mandatory parameters !');
  }

  try {
    utils.getAddress(key);
    utils.getAddress(erc1077address);
  } catch (error) {
    throw new Error('"key" and/or "erc1077address" should be a valid ethereum address !');
  }

  // compute needed values
  const hash = utils.keccak256(utils.toUtf8Bytes(username));

  try {

    const result: Record<string, TxReceipt> = {};

    const codeAtAddress = await relayer.wallet.provider.getCode(erc1077address);
    if (codeAtAddress === '0x') { // if there is already some code at this address : skip deploy
      const deployTx: TxResponse = await relayer.contractFactory.deploy(
        hash,
        `0x${ERC1077.bytecode}`,
        key.toLocaleLowerCase(),
        recoverAddress.toLocaleLowerCase(),
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
  { name, address }: RegisterParams,
  config: RelayerConfig
) {
  const relayer: Relayer = initRelayer(config);

  // check required params
  if (!name || !address) {
    throw new Error('"name" and "address" are mandatory parameters !');
  }

  try {
    utils.getAddress(address);
  } catch (error) {
    throw new Error('"address" should be a valid ethereum address !');
  }

  // in case name is of the form `name.blockframes.eth` we only want the first part to prevent ending with `name.blockframes.eth.blockframes.eth`
  const [labelName] = name.split('.');

  // compute needed values
  const fullName = `${labelName}.${config.baseEnsDomain}`;
  const hash = utils.keccak256(utils.toUtf8Bytes(labelName));

  try {
    /*
    ENS registration require 3 interdependent txs to happens :
    here are the order of the tx and their dependencies

       (A) --> (B) --> (C)     // ENS workflow, (A) must complete before (B)

    */

    const ZERO_ADDRESS = '0x00000000000000000000000000000000000000';

    const retreivedAddress = await relayer.wallet.provider.resolveName(fullName);
    if (!!retreivedAddress && retreivedAddress !== ZERO_ADDRESS) { // if name is already link to a non-zero address : skip
      throw new Error(`${fullName} already linked to an address (${retreivedAddress})`);
    }
    const result: Record<string, TxReceipt> = {};

    // (A) register the user ens username
    const nameOwner = await relayer.registry.owner(utils.namehash(fullName));
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
    const resolverAddress = await relayer.registry.resolver(utils.namehash(fullName))
    if (resolverAddress !== relayer.resolver.address) { // if a resolver is already set : skip set resolver
      const resolverTx: TxResponse = await relayer.registry.setResolver(
        utils.namehash(fullName),
        relayer.resolver.address,
      );
      result['resolver']= await resolverTx.wait();
      console.log(`(B) tx sent (setResolver) : ${resolverTx.hash}`); // display tx to firebase logging
    }

    // (C) link the erc1077 to the ens username : require waiting for (B)
    const linkTx: TxResponse = await relayer.resolver.setAddr(
      utils.namehash(fullName),
      address,
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
  { address, tx }: SendParams,
  config: RelayerConfig
) {
  const relayer: Relayer = initRelayer(config);
  // check required params
  if (!address || !tx) {
    throw new Error('"address" and "tx" are mandatory parameters !');
  }

  try {
    utils.getAddress(address);
  } catch (error) {
    throw new Error('"address" should be a valid ethereum address !');
  }

  // compute needed values
  const erc1077 = new Contract(address, ERC1077.abi, relayer.wallet);

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
    utils.getAddress(adminAddress);
  } catch (error) {
    throw new Error('"adminAddress" should be a valid ethereum address !');
  }

  const organizationFactory = new ContractFactory(ORG_CONTRACT.abi, ORG_CONTRACT.bytecode, relayer.wallet);
  const contract = await organizationFactory.deploy(adminAddress);
  console.log(`tx sent (deployOrganization) : ${contract.deployTransaction.hash}`); // display tx to firebase logging
  await contract.deployed();
  return contract.address;
}
