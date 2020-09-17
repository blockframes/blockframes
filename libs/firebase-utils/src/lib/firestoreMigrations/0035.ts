import { Firestore } from '../types';
import { File as GFile } from '@google-cloud/storage';
import { startMaintenance, endMaintenance, runChunks, getDocAndPath } from '../../';
import { firebase } from '@env';
import { has, get } from 'lodash';
import { privacies } from '@blockframes/utils/file-sanitizer';
export const { storageBucket } = firebase;
const EMPTY_REF = '';

export async function upgrade(_: Firestore, storage: Storage) {
  await startMaintenance();

  const bucket = storage.bucket(storageBucket);
  const files: GFile[] = (await bucket.getFiles())[0];

  await runChunks(files, async (f) => {

    try {
      const { filePath, doc, docData, fieldToUpdate } = await getDocAndPath(f.name);

      const currentMediaValue = get(docData, fieldToUpdate);
      if (has(docData, fieldToUpdate) && currentMediaValue === f.name) {
        const newFilePath = await changeResourceDirectory(filePath, storage, doc.id);
        await doc.update({ [fieldToUpdate]: newFilePath });
      } else {
        await f.delete();
        console.log(`Image ref not found on DB. Removed ${f.name}.`);
      }
    } catch (error) {
      await f.delete();
      console.log(`An error happened when syncing ${f.name}! Removed ${f.name}.`, error.message);
    }

  });

  await endMaintenance();
}

const changeResourceDirectory = async (
  ref: string,
  storage: Storage,
  docId: string
): Promise<string> => {
  const bucket = storage.bucket(storageBucket);

  try {
    let newRef = !privacies.includes(ref.split('/').shift() as any) ? `public/${ref}` : ref;
    newRef = newRef.split(' ').join('-');

    const to = bucket.file(newRef);
    const from = bucket.file(ref);
    const [exists] = await from.exists();

    if (exists) {
      await from.copy(to);
      await from.delete();
      return newRef;
    } else {
      console.log(`Ref ${ref} not found for : ${docId}`);
      return EMPTY_REF;
    }

  } catch (e) {
    console.log(`Error : ${e.message}`);
    return EMPTY_REF;
  }
}
