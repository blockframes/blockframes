import { firebase } from '@env';
import { privacies, Privacy } from '@blockframes/utils/file-sanitizer';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

/**
 * Interface that hold the image options for imgix processing.
 * @note the key names has to be exactly the same as in the imgix api !
 */
export interface ImageParameters {
  /** automatic optimization : https://docs.imgix.com/apis/url/auto/auto */
  auto?: string;
  /** resize behavior : https://docs.imgix.com/apis/url/size/fit */
  fit?: 'clamp' | 'clip' | 'crop' | 'facearea' | 'fill' | 'fillmax' | 'max' | 'min' | 'scale';
  /** aspect ratio https://docs.imgix.com/apis/rendering/size/ar */
  ar?: string;
  /** image width : https://docs.imgix.com/apis/url/size/w */
  w?: number;
  /** image height : https://docs.imgix.com/apis/url/size/h */
  h?: number;
  /** security token : https://github.com/imgix/imgix-blueprint#securing-urls */
  s?: string;
  /** PDF page to display : https://docs.imgix.com/apis/rendering/pdf/page */
  page?: number;
  /** Device Pixel Ratio : https://docs.imgix.com/apis/rendering/pixel-density/dpr */
  dpr?: 1 | 2 | 3 | 4 | 5;
}

export function getImgSize(ref?: string) {
  if (ref?.includes('avatar')) {
    return [50, 100, 300];
  } else if (ref?.includes('logo')) {
    return [50, 100, 300];
  } else if (ref?.includes('poster')) {
    return [200, 400, 600];
  } else if (ref?.includes('banner')) {
    return [300, 600, 1200];
  } else if (ref?.includes('still')) {
    return [300, 600, 1200];
  } else {
    return [1024];
  }
}

/**
 * Transform an `ImageParameters` object into the query string part of an url, ready to sent to imgix.
 * @example
 * const param: ImageParameters = {
 *   fit: 'crop',
 *   w: 100,
 *   h: 100
 * };
 * formatParameters(param); // 'fit=crop&w=100&h=100&'
 */
export function formatParameters(parameters: ImageParameters): string {

  const query = Object.keys(parameters)
    .filter(key => parameters[key])
    .map(key => `${key}=${parameters[key]}`)
    .join('&');

  return query;
}

/**
 * getImgIxResourceUrl : Generate ImgIx resource URL
 * @param ref
 * @param parameters
 */
export function getImgIxResourceUrl(file: StorageFile, parameters: ImageParameters) {
  /**
   * @dev This is the directory that must be set in imgIx source config.
   * @see https://www.notion.so/cascade8/Setup-ImgIx-c73142c04f8349b4a6e17e74a9f2209a
   * If parameters contains "s" attribute, the file is protected and then the protected imgix source
   * must be used (it should be "blockframes-firstName-protected")
   */
  const protectedMediaDir: Privacy = 'protected';
  const query = formatParameters(parameters);
  const imgixSource = parameters.s
    ? `${firebase().projectId}-${protectedMediaDir}`
    : firebase().projectId;

  // This is a safeguard for old storagePaths. Image wont work if privacy is still in the path and is therefore removed in case its there.
  if (privacies.some(privacy => privacy === file.storagePath?.split('/').shift())) {
    console.warn(`Expected storagePath without privacy prefix: ${file.storagePath}`);
    file.storagePath = file.storagePath?.split('/').splice(1).join('/');
  }

  return `https://${imgixSource}.imgix.net/${encodeURI(file.storagePath)}?${query}`;
}
