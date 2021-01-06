import { HostedMediaFormValue, clearHostedMediaFormValue } from './media.firestore';
import { isSafari } from '@blockframes/utils/safari-banner/safari.utils';
import { cloneDeep } from 'lodash';
import type { MovieForm, MovieHostedVideosForm } from '@blockframes/movie/form/movie.form';
import type { ProfileForm } from '@blockframes/auth/forms/profile-edit.form';
import type { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import type { MoviePictureAdminForm } from '@blockframes/admin/admin-panel/forms/movie-admin.form';
import type { OrganizationAdminForm } from '@blockframes/admin/admin-panel/forms/organization-admin.form';
import type { OrganizationMediasForm } from '@blockframes/organization/forms/medias.form';
import type { CampaignForm } from '@blockframes/campaign/form/form'

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

  const cleanedDocument = cloneDeep(form.value);

  const medias = extractMediaFromDocument(cleanedDocument);
  updateMediaFormInForm(form);

  return {
    documentToUpdate: cleanedDocument,
    mediasToUpload: medias,
  };
}

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

export function recursivelyListFiles(document: any): string[] {

  if (typeof document === 'string') {
    return isMedia(document) ? [document] : []

  } else if (Array.isArray(document)) {
    const result = document.map(el => recursivelyListFiles(el));
    // pre-ES2019 Array flattening, with ES2019 we could use Array.prototype.flat()
    return [].concat(...result);

  } else if (!document) {
    return [];

  } else if (typeof document === 'object') {
    const result = Object.keys(document).map(key => recursivelyListFiles(document[key]));
    // pre-ES2019 Array flattening, with ES2019 we could use Array.prototype.flat()
    return [].concat(...result);

  } else {
    return [];
  }
}

/** Check if a string is a media ref (i.e. if it starts with `public/` or `protected/`) */
function isMedia(ref: string) {
  return /^(public\/|protected\/)/gm.test(ref);
}

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

function mediaNeedsUpdate(media: HostedMediaFormValue) {
  return !media.ref || (!!media.ref && !!media.blobOrFile);
}

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
