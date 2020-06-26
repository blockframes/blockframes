import { ImgRef, ExternalMedia } from './media.firestore';
import { isSafari } from '@blockframes/utils/safari-banner/safari.utils';
export * from './media.firestore';

// TODO issue#3088
// export function extractToBeUpdatedMedia(origin: any) {
//   const value = Object.assign({}, origin);
//   const media = extractToBeUpdatedMediaValue(value);
//   return [value, media];
// }

// function extractToBeUpdatedMediaValue(value: any) {
//   let media: ImgRef[] = [];
//   for (const key in value) {
//     if (isMedia(value[key]) && mediaNeedsUpdate(value[key])) {
//       media.push(value[key]);
//       delete value[key];
//     } else if (typeof value[key] === 'object' && !!value[key]) {
//       const childMedia = extractToBeUpdatedMediaValue(value[key]);
//       media = media.concat(childMedia);
//     }
//   }
//   return media;
// }

// function isMedia(obj: any): boolean {
//   return typeof obj === 'object' && !!obj && 'ref' in obj && 'urls' in obj;
// }

// function mediaNeedsUpdate(obj: ImgRef): boolean {
//   return obj.delete || (!!obj.path && !!obj.blob);
// }

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
