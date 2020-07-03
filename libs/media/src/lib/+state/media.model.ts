import { ImgRef, HostedMediaFormValue } from './media.firestore';
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

  // const cleanedDocument = JSON.parse(JSON.stringify(document));
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

      delete document[key];

    } else if (typeof document[key] === 'object' && !!document[key]) {

      const childMedias = extractMediaFromDocument(document[key]);
      medias = medias.concat(childMedias);

    }
  }
  return medias;
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

const formats = {
  avatar: {
    height: 100,
    width: 100
  },
  banner: {
    height: 1080,
    width: 1920
  },
  poster: {
    height: 160,
    width: 120
  }
} as const;

export type Formats = keyof typeof formats;

export function getRatio(format: Formats) {
  const { height, width } = formats[format];
  return width / height;
}

export function getFileNameFromPath(path: string) {
  return path.split('/').pop()
}

/** Return the url of the original image, unless we are on Safari
 * were it returns the fallback image instead
 */
export function getImageUrl(image: ImgRef) {
  return isSafari() ? image.fallback.url : image.original.url;
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
