import { db } from './internals/firebase';
import { Message } from 'firebase-functions/lib/providers/pubsub';

const { ethers } = require('ethers');


const abi = [
  'function scriptsOwner(bytes32) public returns(address)',
  'function addIp(bytes32 _hash)',
  'function scriptsFrom(address _owner) public returns (bytes32[])',
  'event Timestamp(bytes32 indexed scriptHash, address indexed owner)'
];

const i = new ethers.utils.Interface(abi);

export const onIpHash = (message: Message) => {
  const { json } = message;
  const l = i.parseLog(json);
  const txHash = json.transactionHash;

  switch (l.name) {
    case 'Timestamp': {
      const hash = l.values[0];
      // const owner = l.values[1];

      return db.runTransaction(async tx => {
        const hashRef = db.collection('hash').doc(hash);

        const x = await tx.get(hashRef);

        if (!x.exists) {
          console.error('Unknown hash:', hash);
          return;
        }

        const { versionID, ipID }: any = x.data();

        const versionRef = db.collection('ip').doc(ipID).collection('version').doc(versionID);

        const y = {
          timestamp: {
            txHash
          }
        };

        console.info('Updating version:', ipID, versionID, 'with:', y);
        tx.update(versionRef, y);
      });
    }
    default: {
      console.error('Unknown name:', l.name, 'for message:', json);
    }
  }

  return null;
};
