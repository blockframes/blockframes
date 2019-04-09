import { Wallet, ContractFactory, Contract, utils, getDefaultProvider, providers } from "ethers";
import { functions } from "./firebase";
import * as ERC1077 from './contracts/ERC1077.json'
import * as ENS_REGISTRY from './contracts/ENSRegistry.json'
import * as ENS_RESOLVER from './contracts/PublicResolver.json'

type Request = functions.https.Request;
type Response = functions.Response;
type TxResponse = providers.TransactionResponse;
type TxReceipt = providers.TransactionReceipt;

export interface Relayer {
  wallet: Wallet,
  erc1077Factory: ContractFactory,
  namehash: string,
  registry: Contract,
  resolver: Contract
}

export const initRelayer = (): Relayer => {
  let wallet = Wallet.fromMnemonic(functions.config().relayer.mnemonic);
  const provider = getDefaultProvider(functions.config().relayer.network);
  wallet = wallet.connect(provider);
  const erc1077Factory = new ContractFactory(ERC1077.abi, ERC1077.bytecode, wallet);
  const namehash = utils.namehash(functions.config().relayer.basedomain);
  const registry = new Contract(functions.config().relayer.registryaddress, ENS_REGISTRY.abi, wallet);
  const resolver = new Contract(functions.config().relayer.resolveraddress, ENS_RESOLVER.abi, wallet);

  return <Relayer>{
    wallet,
    erc1077Factory,
    namehash,
    registry,
    resolver
  }
};

export const relayerCreateLogic = async(req: Request, res: Response, relayer: Relayer = initRelayer()) => {

  // check required params
  const name = req.body.name;
  const key = req.body.key;
  if (!name || !key) return res.status(400).json({error: '"name" and "key" are mandatory parameters !'});

  try {
    utils.getAddress(key);
  } catch (error) {
    return res.status(400).json({error: '"key" should be a valid ethereum address !'});
  }

  // compute needed values
  const fullName = `${name}.${functions.config().relayer.basedomain}`;
  const hash = utils.keccak256(utils.toUtf8Bytes(name));

  // register the user ens name & deploy his erc1077 contract
  const registerTx: TxResponse = await relayer.registry.functions.setSubnodeOwner(relayer.namehash, hash, relayer.wallet.address);
  const erc1077 = await relayer.erc1077Factory.deploy(key);
  const waitForRegister: Promise<TxReceipt> = registerTx.wait();
  const waitForDeploy: Promise<Contract> = erc1077.deployed();
  const [deployedErc1077] = await Promise.all([waitForDeploy, waitForRegister])

  // set a resolver to the ens name
  const resolverTx: TxResponse = await relayer.registry.functions.setResolver(utils.namehash(fullName), relayer.resolver.address);
  await resolverTx.wait();

  // link the erc1077 to the ens name
  const linkTx = await relayer.resolver.functions.setAddr(utils.namehash(fullName), deployedErc1077.address);

  return res.json({name, key, register: registerTx.hash
    , deploy: erc1077.deployTransaction.hash, resolve: resolverTx.hash, link: linkTx.hash
  });
}

export const relayerSendLogic = async(req: Request, res: Response, relayer: Relayer = initRelayer()) => {
  
  // check required params
  const name = req.body.name;
  const tx = req.body.tx;
  if (!name || !tx) return res.status(400).json({error: '"name" and "tx" are mandatory parameters !'});

  // compute needed values
  const fullName = `${name}.${functions.config().relayer.basedomain}`;
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

  if(!canExecute) {
    res.status(400).json({error: 'The transaction has not been sent beacause it will be be rejected by the ERC1077, this is probably a nonce or signatures problem.'});
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

  return res.json(await sendTx.wait());
}