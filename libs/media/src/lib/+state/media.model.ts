import { HostedMediaFormValue, clearHostedMediaFormValue } from './media.firestore';
import { isSafari } from '@blockframes/utils/safari-banner/safari.utils';
import { cloneDeep } from 'lodash';
export * from './media.firestore';

/**
 * This function **clean** a document from it's medias before updating it in the firestore.
 * We need to clean it because the backend functions are supposed to manage medias in the db,
 * and **not the front**.
 * The function also return an array of media to upload, we can then pass this array to the media service.
 */
export function extractMediaFromDocumentBeforeUpdate(document: any) {

  const cleanedDocument = cloneDeep(document);

  const medias = extractMediaFromDocument(cleanedDocument);
  return {
    documentToUpdate: cleanedDocument,
    mediasToUpload: medias,
  };
}

function extractMediaFromDocument(document: any) {
  let medias: HostedMediaFormValue[] = [];

  for (const key in document) {

    if (isMedia(document[key])) {

      if (mediaNeedsUpdate(document[key])) {
        medias.push(document[key]);
      }

      // convert an `HostedMediaFormValue` into an `HostedMedia`
      // clear form values like `fileName`, `blobOrFile`, etc and keep only `ref` & `url`
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
export function updateMediaFormInForm(form: any) {
  if ("controls" in form) {
    for (const key in form.controls) {
      const control = form.controls[key];
      if (isMedia(control.value)) {
        if (mediaNeedsUpdate(control.value)) {

          // emptying values in blobOrFile and delete to prevent redoing the action on multiple submits.
          // patching oldRef with the new reference. Updating this value in the form prevents emptying the reference multiple saves.
          control.patchValue({
            blobOrFile: '',
            delete: false,
            oldRef: `${control.ref.value}${control.fileName.value}`,
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
    'url' in obj
  );
}

function mediaNeedsUpdate(media: HostedMediaFormValue) {
  return media.delete || (!!media.ref && !!media.blobOrFile);
}

export function getFileNameFromPath(path: string) {
  return path.split('/').pop()
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
