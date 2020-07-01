import { ImgRef } from './media.firestore';
import { isSafari } from '@blockframes/utils/safari-banner/safari.utils';
export * from './media.firestore';

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
