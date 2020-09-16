import { HostedMediaFormValue, clearHostedMediaFormValue } from './media.firestore';
import { isSafari } from '@blockframes/utils/safari-banner/safari.utils';
import { cloneDeep } from 'lodash';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { ProfileForm } from '@blockframes/auth/forms/profile-edit.form';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { OrganizationAdminForm } from '@blockframes/admin/admin-panel/forms/organization-admin.form';
import { PublicUser } from '@blockframes/user/types';
import { Movie } from '@blockframes/movie/+state/movie.model';

/**
 * This function prepare media references in db documents before updating it in firestore.
 * The function also return an array of media to upload, we can then pass this array to the media service.
 */
export function extractMediaFromDocumentBeforeUpdate(
  form: MovieForm | ProfileForm | OrganizationForm | OrganizationAdminForm): { documentToUpdate: any, mediasToUpload: HostedMediaFormValue[] } {

  const cleanedDocument = cloneDeep(form.value);

  const medias = extractMediaFromDocument(cleanedDocument);
  updateMediaFormInForm(form);

  return {
    documentToUpdate: cleanedDocument,
    mediasToUpload: medias,
  };
}

function extractMediaFromDocument(document: Organization | PublicUser | Movie) {
  let medias: HostedMediaFormValue[] = [];

  for (const key in document) {

    if (isMedia(document[key])) {

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
function updateMediaFormInForm(form: MovieForm | ProfileForm | OrganizationForm | OrganizationAdminForm) {
  if ('controls' in form) {
    for (const key in form.controls) {
      const control = form.controls[key];
      if (isMedia(control.value)) {
        if (mediaNeedsUpdate(control.value)) {

          // emptying values in blobOrFile and delete to prevent redoing the action on multiple submits.
          // patching oldRef with the new reference. Updating this value in the form prevents emptying the reference multiple saves.
          control.patchValue({
            blobOrFile: '',
            delete: false,
            oldRef: clearHostedMediaFormValue(control.value), 
          });

        }
      } else if (typeof control === 'object' && !!control) {
        updateMediaFormInForm(control);
      }
    }
  }
}

function isMedia(obj: any) {
  return (
    typeof obj === 'object' &&
    !!obj &&
    'ref' in obj &&
    'oldRef' in obj &&
    'blobOrFile' in obj &&
    'delete' in obj &&
    'fileName' in obj
  );
}

function mediaNeedsUpdate(media: HostedMediaFormValue) {
  return media.delete || (!!media.ref && !!media.blobOrFile);
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
