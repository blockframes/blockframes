
import { privacies, Privacy } from "@blockframes/utils/file-sanitizer";


export interface FileMetaData {
  uid: string;
  privacy: Privacy;
  collection: 'users' | 'orgs' | 'movies' | 'campaigns';
  docId: string;
  field: string;
  [K: string]: string;
};

export interface HostedMediaFormValue {
  ref: string;
  oldRef: string;
  blobOrFile: Blob | File;
  fileName: string;
  metadata: FileMetaData;
}

export interface HostedMediaWithMetadata {
  ref: string,
  title: string
}

export function isValidMetadata(meta?: FileMetaData, options?: { uidRequired: boolean }) {
  if (!meta) return false;
  if (!!options?.uidRequired && (!meta.uid || typeof meta.uid !== 'string')) return false;
  if (!meta.privacy || !privacies.includes(meta.privacy)) return false;
  if (!meta.collection || typeof meta.collection !== 'string') return false;
  if (!meta.docId || typeof meta.docId !== 'string') return false;
  if (!meta.field || typeof meta.field !== 'string') return false;
  return true;
}

export function clearHostedMediaFormValue(formValue: HostedMediaFormValue): string {
  if (!formValue.ref) return '';
  const ref = formValue.ref;
  const refParts = ref.split('/');
  return refParts.pop() === formValue.fileName ?
    `${formValue.ref}` :
    `${formValue.ref}/${formValue.fileName}`;
}

export function createHostedMediaWithMetadata(params: Partial<HostedMediaWithMetadata> = {}): HostedMediaWithMetadata {
  return {
    ref: '',
    title: '',
    ...params
  }
}

export interface UploadData {
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
