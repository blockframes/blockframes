import { ImgRef } from './media.firestore';

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
