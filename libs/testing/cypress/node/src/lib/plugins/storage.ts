import { storage } from '../testing-cypress';

export async function fileExists(path: string) {
 const bucket = storage.bucket();
 const fileObject = bucket.file(path);
 const [exists] = await fileObject.exists();
 return exists;
}
