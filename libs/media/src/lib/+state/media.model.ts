import { ImgRef, OldImgRef } from './media.firestore';

export * from './media.firestore';

export function extractMedia(origin: any) {
  const value = Object.assign({}, origin);
  const media = extractMediaValue(value);
  return [value, media];
}

function extractMediaValue(value: any) {
  let media: ImgRef[] = [];
  for (const key in value) {
    if (isMedia(value[key])) {
      media.push(value[key]);
      delete value[key];
    } else if (typeof value[key] === 'object' && !!value[key]) {
      const childMedia = extractMediaValue(value[key]);
      media = media.concat(childMedia);
    }
  }
  return media;
}

function isMedia(obj: any): boolean {
  return typeof obj === 'object' && !!obj && 'ref' in obj && 'urls' in obj;
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
  type RatioNumber = { height: number, width: number };
  const { height, width }: RatioNumber = format[format];
  return width/height;
}

// @todo(#3063) Remove this verifier
export function isOldImgRef(ref: ImgRef | OldImgRef): ref is OldImgRef {
  return 'url' in ref;
} 

// @todo(#3063) Update this function to unsupport oldImgRef
export function getMediaUrl(ref: ImgRef | OldImgRef) {
  return isOldImgRef(ref) ? ref.url : ref.urls.original;
}