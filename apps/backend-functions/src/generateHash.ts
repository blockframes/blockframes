import { tmpNameSync } from 'tmp';
import * as admin from 'firebase-admin';
import { utils } from 'ethers';
import * as fs from 'fs';
import { ObjectMetadata } from 'firebase-functions/lib/providers/storage';
import { db } from './internals/firebase';

export const RE_IP_UPLOAD = /^ip\/(.+)\/version\/(.+)$/;

function readFile(p: string, encoding: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(p, encoding, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export const hashFile = async (p: string): Promise<string> => {
  const content = await readFile(p, 'hex');
  return utils.keccak256('0x' + content);
};

export const hashToFirestore = async (object: ObjectMetadata) => {
  if (!object.name) {
    console.error('Unknown object name:', object.name);
    return;
  }

  const filePath: string = object.name;
  const match = filePath.match(RE_IP_UPLOAD);

  if (!match) {
    console.error('Unhandled object name:', filePath);
    return;
  }

  const ipID: string | undefined = match[1];
  const versionID: string | undefined = match[2];

  if (!ipID || !versionID) {
    console.error('Missing version in filename:', ipID, versionID);
    return;
  }

  // Prep local temporary file
  const tempLocalFile = tmpNameSync();
  console.info('Created temporary filename: ', tempLocalFile);

  // Download the document into the function
  const bucket = admin.storage().bucket(object.bucket);
  const file = bucket.file(filePath);
  await file.download({ destination: tempLocalFile });
  console.info('The file has been downloaded to', tempLocalFile);

  const ipHash: string = await hashFile(tempLocalFile);

  const x = {
    storage: {
      path: filePath,
      bucket: object.bucket,
      created: admin.firestore.FieldValue.serverTimestamp()
    },
    hash: {
      version: 'keccak256',
      value: ipHash,
      created: admin.firestore.FieldValue.serverTimestamp()
    },
    timestamp: {
      txHash: null
    }

  };

  console.info('Updating our IP document', ipID, versionID, 'with:', x);

  return db.runTransaction(async tx => {
    const versionRef = db.collection('ip').doc(ipID).collection('version').doc(versionID);

    const current = await tx.get(versionRef);
    if (!current.exists) {
      tx.set(versionRef, x);
    } else {
      tx.update(versionRef, x);
    }

    const hashRef = db.collection('hash').doc(ipHash);
    tx.set(hashRef, { versionID, ipID });
  });
};
