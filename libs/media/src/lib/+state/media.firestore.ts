
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { FileMetaData } from './media.model';

/**
* Representation of a storage file in our Firestore db.
* @note this is not the same as the data needed to upload into the storage
*/
export interface StorageFile {
  storagePath: string;
  privacy: Privacy;
  [K: string]: string; // extra-data
}

/**
 * Reference that point to a `StorageFile` in the db.
 * You can query firestore with a `StorageReference` to retrieve a `StorageFile`
 */
export interface StorageReference {
  /**
   * The reference of the document in the Firestore
   * @example 'movies/12345/'
   */
  docRef: string;

  /**
   * The document field that hold the `StorageVideo` object
   * @example 'promotional.videos.screener'
   * @example 'promotional.videos.otherVideos[0]'
   */
  field: string;
}

/**
 * Take a firestore document reference and extract the docId and corresponding collection
 * @param docRef a reference to a document in the Firestore
 * @example
 * getRefInfo('movies/1234'); // { collection: 'movies', docId: '1234' }
 * 
 * getRefInfo('collection/1234/subCollection/5678'); // { collection: 'subCollection', docId: '5678' }
 */
export function getRefInfo(docRef: string) {
  const parts = docRef.split('/').filter(part => !!part);
  const docId = parts.pop();
  const collection = parts.pop();
  return {
    collection,
    docId,
  }
}

// ! DEPRECATED
export interface HostedMediaFormValue {
  ref: string;
  oldRef: string;
  blobOrFile: Blob | File;
  fileName: string;
  metadata: FileMetaData;
}

// ! DEPRECATED
export interface HostedMediaWithMetadata {
  ref: string,
  title: string
}

// ! DEPRECATED
export function clearHostedMediaFormValue(formValue: HostedMediaFormValue): string {
  if (!formValue.ref) return '';
  const ref = formValue.ref;
  const refParts = ref.split('/');
  return refParts.pop() === formValue.fileName ?
    `${formValue.ref}` :
    `${formValue.ref}/${formValue.fileName}`;
}

// ! DEPRECATED
export function createHostedMediaWithMetadata(params: Partial<HostedMediaWithMetadata> = {}): HostedMediaWithMetadata {
  return {
    ref: '',
    title: '',
    ...params
  }
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
