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
}

function getImgSize(ref: string) {
  try {
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
  } catch (_) {
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
 * formatParameters(param); // '?fit=crop&w=100&h=100&'
 */
export function formatParameters(parameters: ImageParameters): string {

  const query = Object.entries(parameters)
    .filter(([key, value]) => !!value)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return query;
}

export function generateImageSrcset(ref: string, parameters: ImageParameters) {

  const sizes = getImgSize(ref);

  const urls = sizes.map(size => {
    const sizeParameters: ImageParameters = { ...parameters, w: size };
    const query = formatParameters(sizeParameters);
    return `https://${firebase.projectId}.imgix.net/${ref}?${query} ${size}w`;
  });

  return urls.join(', ');
}

const BREAKPOINTS_WIDTH = [600, 1024, 1440, 1920];

/**
 * Take a number and an array of values,
 * and returns the value of the array witch is the closest from the number.
 * @example
 * clamp(80, [2, 42, 82, 122, 162]); // 82
 */
function clamp(value: number, clamps: number[]): number {
  return clamps.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

export function generateBackgroundImageUrl(ref: string, parameters: ImageParameters) {

  let clientWidth = 1024;

  if (!!window || !!window.innerWidth) {
    clientWidth = clamp(window.innerWidth, BREAKPOINTS_WIDTH);
  }

  // Math.min(n, undefined) = Nan,
  // to prevent that we use Infinity to pick clientWidth if parameters.width is undefined
  const imageWidth = Math.min(
    clientWidth,
    parameters.w || Infinity,
  );

  const sizeParameters: ImageParameters = { ...parameters, w: imageWidth };
  const query = formatParameters(sizeParameters);

  return `https://${firebase.projectId}.imgix.net/${ref}?${query}`;
}
