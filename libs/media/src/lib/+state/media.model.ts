import { ImgRef, OldImgRef } from './media.firestore';

export * from './media.firestore';

export function extractToBeUpdatedMedia(origin: any) {
  const value = Object.assign({}, origin);
  const media = extractToBeUpdatedMediaValue(value);
  return [value, media];
}

function extractToBeUpdatedMediaValue(value: any) {
  let media: ImgRef[] = [];
  for (const key in value) {
    if (isMedia(value[key]) && mediaNeedsUpdate(value[key])) {
      media.push(value[key]);
      delete value[key];
    } else if (typeof value[key] === 'object' && !!value[key]) {
      const childMedia = extractToBeUpdatedMediaValue(value[key]);
      media = media.concat(childMedia);
    }
  }
  return media;
}

function isMedia(obj: any): boolean {
  return typeof obj === 'object' && !!obj && 'ref' in obj && 'urls' in obj;
}

function mediaNeedsUpdate(obj: ImgRef): boolean {
  return obj.delete || (!!obj.path && !!obj.blob);
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
};

export type Formats = keyof typeof formats;

export function getRatio(format: Formats) {
  const { height, width } = formats[format];
  return width / height;
}

// @todo(#3063) Remove this verifier
export function isOldImgRef(ref: ImgRef | OldImgRef): ref is OldImgRef {
  return 'url' in ref;
}

// @todo(#3063) Update this function to unsupport oldImgRef
export function getMediaUrl(ref: ImgRef | OldImgRef) {
  return isOldImgRef(ref) ? ref.url : ref.urls.original;
}