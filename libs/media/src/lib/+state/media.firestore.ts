
import { FileMetaData } from './media.model';

/**
* Representation of a storage file in our Firestore db.
* @note this is not the same as the data needed to upload into the storage
*/
export interface StorageFile {
  storagePath: string;
  [K: string]: string; // extra-data
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
