export * from './media.firestore';

export function extractMedia(origin: any) {
  const value = Object.assign({}, origin);
  const media = extractMediaValue(value);
  return [value, media];
}

function extractMediaValue(value) {
  let media = [];
  for (const key in value) {
    if (isMedia(value[key])) {
      if (!!value[key]) {
        media.push(value[key]);
      }
      delete value[key];
    } else if (typeof value[key] === 'object' && !!value[key]) {
      const childMedia = extractMediaValue(value[key]);
      media = media.concat(childMedia);
    }
  }
  return media;
}

function isMedia(obj: object): boolean {
  let bool = false;
  if (typeof obj === 'object' && !!obj) {
    if (obj.hasOwnProperty('ref') && obj.hasOwnProperty('urls')) {
      bool = true;
    }
  }
  return bool;
}
