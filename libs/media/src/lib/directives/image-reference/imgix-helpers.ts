import { firebase } from '@env';

/**
 * Interface that hold the image options for imgix processing.
 * @note the key names has to be exactly the same as in the imgix api !
 */
export interface ImageParameters {
  /** automatic optimization : https://docs.imgix.com/apis/url/auto/auto */
  auto?: string;
  /** resize behavior : https://docs.imgix.com/apis/url/size/fit */
  fit?: 'clamp' | 'clip' | 'crop' | 'facearea' | 'fill' | 'fillmax' | 'max' | 'min' | 'scale';
  /** image width : https://docs.imgix.com/apis/url/size/w */
  w?: number;
  /** image height : https://docs.imgix.com/apis/url/size/h */
  h?: number;
  /** security token : https://github.com/imgix/imgix-blueprint#securing-urls */
  s?: string;
}

export function getImgSize(ref: string) {
  if (ref.includes('avatar')) {
    return [50, 100, 300];
  } else if (ref.includes('logo')) {
    return [50, 100, 300];
  } else if (ref.includes('poster')) {
    return [200, 400, 600];
  } else if (ref.includes('banner')) {
    return [300, 600, 1200];
  } else if (ref.includes('still')) {
    return [50, 100, 200];
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

  const query = Object.entries(parameters)
    .filter(([key, value]) => !!value)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return query;
}

export function getImgIxResourceUrl(ref: string, parameters: ImageParameters, protectedMediaDir = 'protected') {
  const query = formatParameters(parameters);
  return `https://${firebase.projectId}${parameters.s ? `-${protectedMediaDir}` : ''}.imgix.net/${ref}?${query}`;
}