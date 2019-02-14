// import * as gcs from '@google-cloud/storage';
import { hashToFirestore } from './generateHash';
import { admin, db, functions } from './firebase';

const { ethers } = require('ethers');

// const GCS = gcs();


const abi = [
  'function scriptsOwner(bytes32) public returns(address)',
  'function addIp(bytes32 _hash)',
  'function scriptsFrom(address _owner) public returns (bytes32[])',
  'event Timestamp(bytes32 indexed scriptHash, address indexed owner)'
];


const i = new ethers.utils.Interface(abi);

export const onIpHashEvent = functions.pubsub
  .topic('eth-events.ipHash')
  .onPublish((message) => {
    const { json } = message;
    const l = i.parseLog(json);

    switch (l.name) {
      case 'Timestamp': {
        const hash = l.values[0];
        const owner = l.values[1];

        return db.runTransaction(async tx => {
          const account = db.collection('accounts').doc(owner);
          const timestampLog = db.collection('timestamps').doc();

          // Get / Create account value
          const current = await tx.get(account);
          let d: any = { value: 10, created: admin.firestore.FieldValue.serverTimestamp() };
          if (current.exists) {
            d = current.data();
          }

          // Update account value
          d.updated = admin.firestore.FieldValue.serverTimestamp();
          d.value -= 1;

          if (current.exists) {
            tx.update(account, d);
          } else {
            tx.set(account, d);
          }

          // Log timestamp (maphash <-> users)
          tx.set(timestampLog, { hash, owner, created: admin.firestore.FieldValue.serverTimestamp() });
        });
      }
      default: {
        console.error('Unknown name:', l.name, 'for message:', json);
      }
    }

    return null;
  });

export const generateHash = functions.storage.object().onFinalize(hashToFirestore);
