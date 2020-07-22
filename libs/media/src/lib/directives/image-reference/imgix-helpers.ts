import { firebase } from '@env';
import { getImgSize } from '@blockframes/media/+state/media.model';

export interface ImageParameters {
  /** automatic optimization : https://docs.imgix.com/apis/url/auto/auto */
  auto?: string;
  /** resize behavior : https://docs.imgix.com/apis/url/size/fit */
  fit?: 'clamp' | 'clip' | 'crop' | 'facearea' | 'fill' | 'fillmax' | 'max' | 'min' | 'scale';
  /** image width : https://docs.imgix.com/apis/url/size/w */
  width?: number;
  /** image height : https://docs.imgix.com/apis/url/size/h */
  height?: number;
}

/**
 * Transform an `ImageParameters` object into the query string part of an url, ready to sent to imgix.
 * @example
 * const param: ImageParameters = {
 *   fit: 'crop',
 *   width: 100,
 *   height: 100
 * };
 * formatParameters(param); // '?fit=crop&w=100&h=100&'
 */
export function formatParameters(parameters: ImageParameters): string {
  let query = '';

  if (!!parameters.auto) {
    query += `auto=${parameters.auto}&`;
  }

  if (!!parameters.fit) {
    query += `fit=${parameters.fit}&`;
  }

  if (!!parameters.width) {
    query += `w=${parameters.width}&`;
  }

  if (!!parameters.height) {
    query += `h=${parameters.height}&`;
  }

  return query;
}

export function generateImageSrcset(ref: string, parameters: ImageParameters) {

  const sizes = getImgSize(ref);

  const urls = sizes.map(size => {
    const sizeParameters = { ...parameters, width: size };
    const query = formatParameters(sizeParameters);
    return `https://${firebase.projectId}.imgix.net/${ref}?${query} ${size}w`;
  });

  return urls.join(', ');
}
