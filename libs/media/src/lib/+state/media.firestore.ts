
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { FileMetaData } from './media.model';

/**
* Representation of a storage file in our Firestore db.
* @note this is not the same as the data needed to upload into the storage: `UploadData`
*/
export interface StorageFile {
  privacy: Privacy;
  collection: 'movies' | 'users' | 'orgs' | 'campaigns';
  docId: string;
  field: string;
  storagePath: string;
  [K: string]: string; // extra-data
}

export function createStorageFile(file: Partial<StorageFile>): StorageFile {
  return {
    privacy: 'public',
    collection: 'movies',
    docId: '',
    field: '',
    storagePath: '',
    ...file,
  };
}

export interface StorageVideo extends StorageFile {
  jwPlayerId: string;
}


// ! DEPRECATED
export interface OldUploadData {
  /**
  * firebase storage upload path *(or ref)*,
  * @note **Make sure that the path param does not include the filename.**
  * @note **Make sure that the path does not ends with a `/`.**
  */
  path: string,
  data: Blob | File,
  fileName: string,
  metadata: FileMetaData,
}
