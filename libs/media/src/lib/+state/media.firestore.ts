import { MovieNote, MovieVideo } from '@blockframes/model';
import { Privacy } from '@blockframes/utils/file-sanitizer';

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
