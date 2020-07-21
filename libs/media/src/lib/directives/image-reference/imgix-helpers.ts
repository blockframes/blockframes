
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

export function formatParameter(parameters: ImageParameters): string {
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

  if (!!parameters.width) {
    query += `h=${parameters.height}&`;
  }

  return query;
}

/**
 * Calculate the nearest viewport size in steps of `THRESHOLD`px
 * @param THRESHOLD steps in px to round the current `window.innerWidth`, default value is `200`
 * @example
 * // for THRESHOLD = 200 we get :
 * 98 -> 200,
 * 125 -> 200,
 * 200 -> 200,
 * 201 -> 400,
 * 550 -> 600,
 * 700 -> 800,
 * etc...
 */
export function calculateViewPortWidth(THRESHOLD:number=200) { // TODO THIS IS NOT COOL

  if (!window || !window.innerWidth) return 1000;

  if (THRESHOLD < 1) THRESHOLD = 1;

  // we do this to get a defined range of possible width to take advantage of image caching
  // this is basically a tradeoff between network request size and caching
  // low threshold = small request size and lower use of caching = bigger imgix bill, but smaller load time
  // big threshold = lots of caching = smaller imgix bill but app might be slower because of bigger images

  // get the nearest viewport size in steps of <THRESHOLD>px,
  return Math.ceil(window.innerWidth / THRESHOLD) * THRESHOLD;
}
