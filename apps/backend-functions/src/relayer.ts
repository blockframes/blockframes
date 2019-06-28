import { Wallet, Contract, utils, getDefaultProvider, providers } from 'ethers';
import { db } from './firebase';
import * as CREATE2_FACTORY from './contracts/Factory2.json';
import * as ERC1077 from './contracts/ERC1077.json';
import * as ENS_REGISTRY from './contracts/ENSRegistry.json';
import * as ENS_RESOLVER from './contracts/PublicResolver.json';
import { getByteCode } from './contracts/byteCode';

type TxResponse = providers.TransactionResponse;

export interface Relayer {
  wallet: Wallet;
  contractFactory: Contract;
  namehash: string;
  registry: Contract;
  resolver: Contract;
  getNonce: () => Promise<number>;
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
  username: string;
  tx: any; // TODO META-TX INTERFACE
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

let nonceOffset = 0;
export const initRelayer = (config: RelayerConfig): Relayer => {
  let wallet = Wallet.fromMnemonic(config.mnemonic);
  const provider = getDefaultProvider(config.network);
  wallet = wallet.connect(provider);
  const contractFactory = new Contract(config.factoryContract, CREATE2_FACTORY.abi, wallet);
  const namehash = utils.namehash(config.baseEnsDomain);
  const registry = new Contract(config.registryAddress, ENS_REGISTRY.abi, wallet);
  const resolver = new Contract(config.resolverAddress, ENS_RESOLVER.abi, wallet);

  const getNonce = async() => { // TODO Ethers v5 will handle the nonce automatically, remove this after migration to v5
    const nonce = await wallet.getTransactionCount();
    nonceOffset++;
    return nonce + nonceOffset;
  };

  return <Relayer>{
    wallet,
    contractFactory,
    namehash,
    registry,
    resolver,
    getNonce
  };
};

interface UserInfos {
  username: string;
  key: string,
  erc1077address: string
};

export const relayerCreateLogic = async (
  { username, key, erc1077address }: UserInfos,
  config: RelayerConfig
) => {
  const relayer: Relayer = initRelayer(config);

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
  const fullName = `${username}.${config.baseEnsDomain}`;
  const hash = utils.keccak256(utils.toUtf8Bytes(username));
  const byteCode = getByteCode(key.toLocaleLowerCase(), '0x4D7e2f3ab055FC5d484d15aD744310dE98dD5Bc3'.toLocaleLowerCase()); // compute full contract byte code // TODO change hardcoded recover address

  try {

    /*
    Deployement require 5 interdependent txs to happens :
    here are the order of the tx and their dependencies

       (A) --> (B) --> (C)     // ENS workflow
        ||      ||
       (D) --> (E)             // Deploy workflow

      || means tx can happen at the same time,
     (A)->(B) means (A) must complete before (B)
    */

    const ZERO_ADDRESS = '0x00000000000000000000000000000000000000';
    const ensWorkFlow = async () => {
      const retreivedAddress = await relayer.wallet.provider.resolveName(fullName);
      if (retreivedAddress !== ZERO_ADDRESS) { // if name is already link to a non-zero address : skip ensWorkflow
        const result: {[key: string]: string | undefined } = {};

        // (A) register the user ens username
        const nameOWner = await relayer.registry.owner(utils.namehash(fullName));
        if (nameOWner !== relayer.wallet.address) { // if name is already registered : skip registration
          const registerTx: TxResponse = await relayer.registry.setSubnodeOwner(
            relayer.namehash,
            hash,
            relayer.wallet.address,
            { nonce: await relayer.getNonce() }
          );
          console.log(`(A) tx sent (register) : ${registerTx.hash}`); // display tx to firebase logging
          result['register'] = registerTx.hash;
          await registerTx.wait();
        }

        // (B) set a resolver to the ens username : require waiting for (A)
        const resolverAddress = await relayer.registry.resolver(utils.namehash(fullName))
        if (resolverAddress !== relayer.resolver.address) { // if a resolver is already set : skip set resolver
          const resolverTx: TxResponse = await relayer.registry.setResolver(
            utils.namehash(fullName),
            relayer.resolver.address,
            { nonce: await relayer.getNonce() }
          );
          console.log(`(B) tx sent (setResolver) : ${resolverTx.hash}`); // display tx to firebase logging
          result['resolver'] = resolverTx.hash;
          await resolverTx.wait();
        }

        // (C) link the erc1077 to the ens username : require waiting for (B)
        const linkTx: TxResponse = await relayer.resolver.setAddr(
          utils.namehash(fullName),
          erc1077address,
          { nonce: await relayer.getNonce() }
        );
        console.log(`(C) tx sent (setAddress) : ${linkTx.hash}`); // display tx to firebase logging
        result['link'] = linkTx.hash;
        await linkTx.wait(); // ???
        return result;
      }
      return;
    };

    const deployWorkFlow = async () => {
      const result: {[key: string]: string | undefined } = {};
      const actualByteCode = await relayer.contractFactory.getByteCode();

      // (D) set user bytecode
      if (actualByteCode !== byteCode) { // if the factory already contains the good byteCode : skip set byteCode
        const setByteCodeTx: TxResponse = await relayer.contractFactory.setByteCode(byteCode, { nonce: await relayer.getNonce() });
        console.log(`(D) tx sent (setByteCode) : ${setByteCodeTx.hash}`); // display tx to firebase logging
        result['byteCode'] = setByteCodeTx.hash;
        await setByteCodeTx.wait();
      }

      // (E) deploy ERC1077 : require waiting for (D)
      const codeAtAddress = await relayer.wallet.provider.getCode(erc1077address);
      if (codeAtAddress === '0x') { // if there is already some code at this address : skip deploy
        const deployTx: TxResponse = await relayer.contractFactory.deploy(hash, { nonce: await relayer.getNonce() });
        console.log(`(E) tx sent (deploy) : ${deployTx.hash}`); // display tx to firebase logging
        result['deploy'] = deployTx.hash;
        await deployTx.wait();
      }

      return result;
    };
    const [ ensResult, deployResult ] = await Promise.all([ensWorkFlow(), deployWorkFlow()]);
    return { ens: ensResult, deploy: deployResult };
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const relayerSendLogic = async (
  { username, tx }: SendParams,
  config: RelayerConfig
) => {
  const relayer: Relayer = initRelayer(config);
  // check required params
  if (!username || !tx) {
    throw new Error('"username" and "tx" are mandatory parameters !');
  }

  // compute needed values
  const fullName = `${username}.${config.baseEnsDomain}`;
  const erc1077 = new Contract(fullName, ERC1077.abi, relayer.wallet);

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
    throw new Error(
      'The transaction has not been sent beacause it will be be rejected by the ERC1077, this is probably a nonce or signatures problem.'
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

// TODO BETTER SECURITY !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const MAX_AUTHORIZED_TOKEN_TRANSFER = 0.1;

export const relayerRequestTokensLogic = async (
  { username, amount }: RequestTokensParams,
  config: RelayerConfig
) => {
  const relayer: Relayer = initRelayer(config);
  // check required params
  if (!username || !amount) {
    throw new Error('"username" and "amount" are mandatory parameters !');
  }
  // prevent user to empty the wallet
  if (amount > MAX_AUTHORIZED_TOKEN_TRANSFER) {
    throw new Error(`"amount" (${amount}) must be less than ${MAX_AUTHORIZED_TOKEN_TRANSFER}`);
  }
  // compute needed values
  const fullName = `${username}.${config.baseEnsDomain}`;

  const weiAmount = utils.parseEther(`${amount}`);

  const tx = await relayer.wallet.sendTransaction({to: fullName, value: weiAmount});
  console.log(`tx sent (request tokens) : ${tx.hash}`); // display tx to firebase logging
  return tx;
};


export const relayerSignDeliveryLogic = async (
  { username, deliveryId, stakeholderId }: SignDeliveryParams,
  config: RelayerConfig
) => {
  if (!username || !deliveryId || !stakeholderId) {
    throw new Error('"username", "deliveryId" and "stakeholderId" are mandatory parameters !');
  }
  const relayer: Relayer = initRelayer(config);
  // compute needed values
  const fullName = `${username}.${config.baseEnsDomain}`;
  const hash = utils.keccak256(utils.toUtf8Bytes(deliveryId));
  const tx = await relayer.wallet.sendTransaction({to: fullName, data: hash});

  await db.doc(`deliveries/${deliveryId}/stakeholders/${stakeholderId}`).update({tx: tx.hash});

  console.log(`tx sent (sign delivery) : ${tx.hash}`); // display tx to firebase logging
  return tx;

}
