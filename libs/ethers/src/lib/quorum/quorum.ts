
import { JsonRpcProvider } from '@ethersproject/providers';
import { ContractFactory } from '@ethersproject/contracts';
import { AbiCoder } from '@ethersproject/abi';
import { id as keccak256 } from '@ethersproject/hash';
import { quorum } from '@env';

import { abi, bytecode } from '@blockframes/smart-contracts/quorum/movie2.json';

export interface QuorumNodeCredentials {
  url: string;
  user: string;
}

function quorumProvider(credential: QuorumNodeCredentials, password: string) {
  return new JsonRpcProvider({
    url: credential.url,
    user: credential.user,
    password
  });
}

/** calculate the solidity function id */
function getFunctionId(functionSignature: string) {
  return keccak256(functionSignature).substr(0, 10);
}

// TODO ISSUE#1560 MAKE CODE MORE GENERIC
/**
* Function called by an Archipel-Content admin (via a page in the admin UI).
* This function will connect to Archipel-Content's quorum node and then deploy a new movie smart-contract
*/
export async function deployMovieContract(
    /** the quorum node password */
    password: string,
  ) {

    const provider = quorumProvider(quorum.archipelNode, password);

    const movieContractFactory = new ContractFactory(abi, bytecode, provider.getSigner());
    const deployBytecode = movieContractFactory.getDeployTransaction(quorum.pulsarlNode.ethAddress).data; // ! maybe the owner should not be hardcoded, for Berlin poc it should be fine though

    const deployTx = {
      from: quorum.archipelNode.ethAddress, // 'from' field is MANDATORY for a JSON RPC send
      data: deployBytecode,
      gas: '0x2fefd800', // in quorum we don't care about the gas so we set it to the maximum possible amount (BLOCK_GAS_LIMIT = 800 000 000)
      privateFor: [quorum.pulsarlNode.privateFor], // Must be an array, AC's privateFor is optional because it's the tx sender
    }
    const txHash = await provider.send('eth_sendTransaction', [deployTx]);
    const txReceipt = await provider.getTransaction(txHash) as any;

    // logging to Firebase function's console
    console.log(`**quorum movie smart-contract should be deployed @ ${txReceipt['creates']}**`);

    return txReceipt;
  }

  // TODO ISSUE#1560 MAKE CODE MORE GENERIC
  /**
  * Function called by an Archipel-Content admin (via a page in the admin UI).
  * This function will connect to Archipel-Content's quorum node and then set a movie's initial share.
  * For example : Pulsar 90% and AC 10%
  */
  export async function setInitialRepartition(
    /** the quorum node password */
    password: string,
    /** the eth address of the movie smart-contract */
    contractAddress: string,
    /** percentage to give to participant (ex: Pulsar), meaning we get (100 - initialRepartition) for ourselves */
    initialRepartition: number,
  ) {

    if (initialRepartition < 0 || initialRepartition > 100) {
      throw new Error(`'initialRepartition' must be a valid percentage (0-100) but ${initialRepartition} was given!`);
    }

    const provider = quorumProvider(quorum.archipelNode, password);

    const abiCoder = new AbiCoder();
    const functionId = getFunctionId('addDeal(address,address,uint256,uint256)');
    const functionParams = abiCoder.encode(
      ['address','address','uint256','uint256'],
      [
        quorum.pulsarlNode.ethAddress, // participant A
        quorum.archipelNode.ethAddress, // participant B
        initialRepartition, // participant A's share (Pulsar) ex: 90-> Pulsar get 90% and so AC get 10%
        0, // parent share id : 0 for the initial share (see movie2.sol implementation for more details)
      ]
    ).substr(2); // remove leading '0x'
    const tx = {
      from: quorum.archipelNode.ethAddress,
      to: contractAddress,
      gas: '0x2fefd800', // setting 'gas' to 'BLOCK_GAS_LIMIT'
      data: `${functionId}${functionParams}`,
      privateFor: [quorum.pulsarlNode.privateFor], // this transaction is private between us and pulsar
    }
    const txHash = await provider.send('eth_sendTransaction', [tx]);
    const txReceipt = await provider.getTransaction(txHash) as any;

    // logging to Firebase function's console
    console.log(`**quorum movie smart-contract initial repartition set @ ${txHash}**`);

    return txReceipt;
  }
