import { HostedMediaFormValue, clearHostedMediaFormValue } from './media.firestore';
import { isSafari } from '@blockframes/utils/browser/utils';
import type { MovieForm, MovieHostedVideosForm } from '@blockframes/movie/form/movie.form';
import type { ProfileForm } from '@blockframes/auth/forms/profile-edit.form';
import type { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import type { MoviePictureAdminForm } from '@blockframes/admin/admin-panel/forms/movie-admin.form';
import type { OrganizationAdminForm } from '@blockframes/admin/admin-panel/forms/organization-admin.form';
import type { OrganizationMediasForm } from '@blockframes/organization/forms/medias.form';
import type { CampaignForm } from '@blockframes/campaign/form/form'
import { privacies, Privacy } from "@blockframes/utils/file-sanitizer";


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

// ! DEPRECATED
/**
 * This function prepare media references in db documents before updating it in firestore.
 * The function also return an array of media to upload, we can then pass this array to the media service.
 */
export function extractMediaFromDocumentBeforeUpdate(
  form: MovieForm |
    ProfileForm |
    OrganizationForm |
    OrganizationAdminForm |
    OrganizationMediasForm |
    MovieHostedVideosForm |
    CampaignForm |
    MoviePictureAdminForm
): { documentToUpdate: any, mediasToUpload: HostedMediaFormValue[] } {

  const cleanedDocument = JSON.parse(JSON.stringify(form.value));

  const medias = extractMediaFromDocument(cleanedDocument);
  updateMediaFormInForm(form);

  return {
    documentToUpdate: cleanedDocument,
    mediasToUpload: medias,
  };
}

// ! DEPRECATED
function extractMediaFromDocument(document: any) {
  let medias: HostedMediaFormValue[] = [];

  for (const key in document) {

    if (isMediaForm(document[key])) {

      if (mediaNeedsUpdate(document[key])) {
        medias.push(document[key]);
      }

      // convert an `HostedMediaFormValue` into a simple `string`
      document[key] = clearHostedMediaFormValue(document[key]);

    } else if (typeof document[key] === 'object' && !!document[key]) {

      const childMedias = extractMediaFromDocument(document[key]);
      medias = medias.concat(childMedias);

    }
  }
  return medias;
}

// ! DEPRECATED
/**
 * Loops over form looking for mediaForms that need to be updated and then resets that form.
 */
function updateMediaFormInForm(form: any) {
  if ('controls' in form) {
    for (const key in form.controls) {
      const control = form.controls[key];
      if (isMediaForm(control.value)) {
        if (mediaNeedsUpdate(control.value)) {

          // emptying values in blobOrFile and delete to prevent redoing the action on multiple submits.
          // patching oldRef with the new reference. Updating this value in the form prevents emptying the reference multiple saves.
          control.patchValue({
            blobOrFile: '',
            oldRef: clearHostedMediaFormValue(control.value),
          });

        }
      } else if (typeof control === 'object' && !!control) {
        updateMediaFormInForm(control);
      }
    }
  }
}

// ! DEPRECATED
export function recursivelyListFiles(document: any): string[] {

  if (typeof document === 'string') {
    return isMedia(document) ? [document] : []

  } else if (Array.isArray(document)) {
    const result = document.map(el => recursivelyListFiles(el));
    // pre-ES2019 Array flattening, with ES2019 we could use Array.prototype.flat()
    // return [].concat(...result);
    return result.flat();

  } else if (!document) {
    return [];

  } else if (typeof document === 'object') {
    const result = Object.keys(document).map(key => recursivelyListFiles(document[key]));
    // pre-ES2019 Array flattening, with ES2019 we could use Array.prototype.flat()
    // return [].concat(...result);
    return result.flat();

  } else {
    return [];
  }
}

// ! DEPRECATED
/** Check if a string is a media ref (i.e. if it starts with `public/` or `protected/`) */
function isMedia(ref: string) {
  return /^(public\/|protected\/)/gm.test(ref);
}

// ! DEPRECATED
export function isMediaForm(obj: any) {
  return (
    typeof obj === 'object' &&
    !!obj &&
    'ref' in obj &&
    'oldRef' in obj &&
    'blobOrFile' in obj &&
    'fileName' in obj
  );
}

// ! DEPRECATED
function mediaNeedsUpdate(media: HostedMediaFormValue) {
  return !media.ref || (!!media.ref && !!media.blobOrFile);
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
  const format = asset.split('.').pop();
  if (format === 'webp') {
    return isSafari()
      ? `assets/${type}/${theme}-fallback/${asset.replace('.webp', '.png')}`
      : `assets/${type}/${theme}/${asset}`
  } else {
    return `assets/${type}/${theme}/${asset}`;
  }
}
