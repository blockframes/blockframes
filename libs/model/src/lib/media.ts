
import { privacies, Privacy } from '@blockframes/utils/file-sanitizer';
import { MovieNote, MovieVideo } from '@blockframes/model';

/**
 * Representation of a storage file in our Firestore db.
 * @note this is not the same as the data needed to upload into the storage: `UploadData`
 */
export interface StorageFile {
  privacy: Privacy;
  collection: 'movies' | 'users' | 'orgs' | 'campaigns' | 'cms/festival/home';
  docId: string;
  field: string;
  storagePath: string;
  [K: string]: string; // extra-data
}

export function createStorageFile(file: Partial<StorageFile> = {}): StorageFile {
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

export type MediaOutput = StorageFile[] | MovieVideo[] | MovieNote[] | string | MovieVideo;

/**
 * Data needed by the `FileUploaderService` to actually upload into the storage.
 */
export interface UploadData {
  fileName: string;
  file: Blob | File;
  metadata: FileMetaData;
}

/**
 * File metadata required by the backend function in order to complete the upload flow.
 * @note every extra-data keys will be copied into the Firestore db
 */
export interface FileMetaData {
  uid: string;
  fileId?: string; // unique id required for list of videos
  privacy: Privacy;
  collection: 'users' | 'orgs' | 'movies' | 'campaigns';
  docId: string;
  field: string;
  [K: string]: string; // extra-data
};

export function isValidMetadata(meta?: FileMetaData, options?: { uidRequired: boolean }) {
  if (!meta) return false;
  if (!!options?.uidRequired && (!meta.uid || typeof meta.uid !== 'string')) return false;
  if (!meta.privacy || !privacies.includes(meta.privacy)) return false;
  if (!meta.collection || typeof meta.collection !== 'string') return false;
  if (!meta.docId || typeof meta.docId !== 'string') return false;
  if (!meta.field || typeof meta.field !== 'string') return false;
  return true;
}

export function isFile(object: any) {
  return typeof object === 'object'
    && 'privacy' in object
    && 'collection' in object
    && 'docId' in object
    && 'field' in object
    && 'storagePath' in object
    && !!object.storagePath
    ;
}

export function recursivelyListFiles(document: any): StorageFile[] {

  if (!document) {
    return [];

  } else if (Array.isArray(document)) {
    const result = document.map(el => recursivelyListFiles(el));
    return result.flat();

  } else if (typeof document === 'object') {

    if (isFile(document)) {
      return [document];
    } else {
      const result = Object.keys(document).map(key => recursivelyListFiles(document[key]));
      return result.flat();
    }

  } else {
    return [];
  }
}

// TODO issue#4002 MOVE THE 2 FUNCTIONS BELLOW ELSEWHERE
export function getFileNameFromPath(path: string) {
  if (typeof path !== 'string') {
    console.warn('UNEXPECTED PATH', path);
  }
  return (!!path && typeof path === 'string') ? path.split('/').pop() : '';
}

/** Used this only for background to let the browser deal with that with picture */
export function getAssetPath(asset: string, theme: 'dark' | 'light', type: 'images' | 'logo' = 'images') {
  return `assets/${type}/${theme}/${asset}`;
}