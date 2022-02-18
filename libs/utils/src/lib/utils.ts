import { Person } from './common-interfaces';
import { staticModel, Scope, GroupScope, StaticGroup, staticGroups } from '@blockframes/utils/static-model';
import { LanguageRecord } from '@blockframes/movie/+state/movie.firestore';

export interface ErrorResultResponse {
  error: string;
  result: any;
}

/**
 * replaces accented characters with their closes neighbour
 * in english characters
 * @link https://stackoverflow.com/a/37511463/6441976
 */
export function removeAccent<T>(str: T) {
  if (typeof str === 'string') return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return str;
}

export function jsonDateReviver(key: unknown, value: any) {
  if (!value) return value;

  const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,}|)Z$/;
  if (typeof value === "string" && dateFormat.test(value)) return new Date(value);
  if (typeof value === 'object' && Object.keys(value).length === 2 && ['nanoseconds', 'seconds'].every(k => k in value))
    return new Date((value.nanoseconds * 1 ^ -6) + (value.seconds * 1000));

  return value;
}

export function titleCase(text: string) {
  if (!text) return '';
  return text[0].toUpperCase() + text.substring(1);
}

export function displayName(person: Person) {
  return `${titleCase(person.firstName)} ${titleCase(person.lastName)}`;
}

/**
 * Take a number and an array of values,
 * and returns the value of the array witch is the closest from the number.
 * @example
 * clamp(80, [2, 42, 82, 122, 162]); // 82
 */
export const clamp = (value: number, clamps: number[]): number => {
  return clamps.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

export const allowedFileType = ['pdf', 'image', 'video', 'docx', 'xls', 'json', 'csv'] as const;
export type AllowedFileType = typeof allowedFileType[number];

export interface FileDefinition { mime: string[], extension: string[] };
export const allowedFiles: Record<AllowedFileType, FileDefinition> = {
  pdf: {
    mime: ['application/pdf'],
    extension: ['.pdf'],
  },
  image: {
    mime: ['image/jpeg', 'image/png', 'image/webp'],
    extension: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  video: {
    mime: ['video/x-msvideo', 'video/x-matroska', 'video/mp4', 'video/3gpp', 'video/quicktime', 'video/x-ms-wmv'],
    extension: ['.avi', '.mkv', '.mp4', '.3gp', '.mov', '.wmv'],
  },
  docx: {
    mime: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extension: ['.doc', '.docx'],
  },
  xls: {
    mime: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.oasis.opendocument.spreadsheet'],
    extension: ['.xls', '.xlsx', '.ods'],
  },
  json: {
    mime: ['application/json'],
    extension: ['.json']
  },
  csv: {
    mime: ['text/csv'],
    extension: ['.csv']
  }
}

/**
 * Convert a file extension into the corresponding file type.
 * @example
 * extensionToFileType('png'); // 'image'
 * extensionToFileType('mp4'); // 'video'
 * extensionToFileType('docx'); // 'docx'
 * @note if the function doesn't find any matching file type it will return `'unknown'`
 */
export function extensionToType(extension: string): AllowedFileType | 'unknown' {

  const dotExtension = extension.startsWith('.') ? extension : '.' + extension;

  // we use a for in loop so we can directly return when a match is found
  // (returning in a forEach just end the current iteration)
  for (const type in allowedFiles) {
    const match = allowedFiles[type].extension.some(fileExtension => fileExtension === dotExtension);
    if (match) return type as AllowedFileType;
  }

  return 'unknown';
}

export async function loadJWPlayerScript(document: Document, playerUrl: string) {
  return new Promise<void>(res => {
    const id = 'jwplayer-script';

    // check if the script tag already exists
    if (!document.getElementById(id)) {
      const script = document.createElement('script');
      script.setAttribute('id', id);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('src', playerUrl);
      script.setAttribute('data-loaded', 'false');
      document.head.appendChild(script);
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        res();
      }
    } else { // script tag exists
      const script = document.getElementById(id) as HTMLScriptElement;
      const loaded = script.getAttribute('data-loaded');

      if (loaded === 'true') { // already loaded
        res();
      } else { // script tag exist but hasn't finished to load yet: check every 0,1s if it has finished
        let ttl = 50; // 50 x 0,1s = 5s
        const intervalId = window.setInterval(() => {
          if (ttl <= 0) { // abort after 5s
            window.clearInterval(intervalId);
            res();
          }

          const newLoaded = script.getAttribute('data-loaded');
          if (newLoaded === 'true') {
            window.clearInterval(intervalId);
            res();
          } else {
            ttl--;
          }
        }, 100); // 0,1s
      }
    }
  });
}

/** Take size in Bytes and parse it into a human readable string */
export function fileSizeToString(fileSize: number) {
  const size = fileSize / 1000;
  if (size < 1000) {
    return `${size.toFixed(1)} KB`;
  } else if (size < 1000 * 1000) {
    return `${(size / 1000).toFixed(1)} MB`;
  } else {
    return `${(size / (1000 * 1000)).toFixed(1)} GB`;
  }
}

/** Return the max allowed file size in **Bytes** for a given type of file */
export function maxAllowedFileSize(type: AllowedFileType) {
  switch (type) {
    case 'image':
    case 'docx':
    case 'xls':
    case 'json':
    case 'csv':
      return 5 * 1000000; // 5MB in bytes
    case 'pdf':
      return 50 * 1000000; // 50MB in bytes
    case 'video':
      return 50000 * 1000000; // 50GB in bytes
  }
}

/**
 *
 * @param orgName:Must be greater than 2 characters.
 */
export function createOfferId(orgName: string) {
  const suffix = orgName.substring(0, 3).toUpperCase();
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += `${Math.floor(Math.random() * 10)}`;
  }
  return `${suffix}-${id}`;
}

/**
 *
 * @param email
 * @param firstName
 * @param lastName
 * @returns string
 *
 * https://developer.jwplayer.com/jwplayer/docs/jw8-javascript-api-reference
 * https://developer.jwplayer.com/jwplayer/docs/jw8-add-custom-icons
 * https://css-tricks.com/probably-dont-base64-svg/
 */
export function getWatermark(email: string = '', firstName: string = '', lastName: string = '') {
  const svg = `
    <svg id="jwplayer-user-watermark" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg">
      <style>
        #jwplayer-user-watermark text { text-anchor: end; }
        #jwplayer-user-watermark .name { font: 32px Arial; }
        #jwplayer-user-watermark .email { font: italic 24px Arial;}
      </style>
      <text x="100%" y="35%" fill="#fff" stroke="#000" class="name">${firstName} ${lastName}</text>
      <text x="100%" y="25%" fill="#fff" stroke="#000" class="email">${email ?? ''}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function toLabel(value: string | string[], scope: Scope, joinWith?: string, endWith?: string): string {
  if (!value) return '';
  try {
    if (Array.isArray(value)) {
      return smartJoin(value.map(val => staticModel[scope][val]), joinWith, endWith);
    } else {
      return staticModel[scope][value];
    }
  } catch (error) {
    console.error(`Could not find label for key "${value}" in scope "${scope}"`);
    if (typeof value === 'string') return value;
    return '';
  }
}

export function toGroupLabel(value: string[], scope: GroupScope, all?: string) {

  const groups: StaticGroup[] = staticGroups[scope];

  const allItems = groups.reduce((items, group) => items.concat(group.items), []);

  if (allItems.length === value.length) return [all];

  return groups.map(group => {
    const items = [];
    for (const item of group.items) {
      if (value.includes(item)) items.push(staticModel[scope][item]);
    }
    return items.length === group.items.length
      ? group.label
      : items;
  })
    .sort((a) => typeof a === 'string' ? -1 : 1)
    .flat()
    .filter(v => !!v);
}

/**
 * Example with (['A', 'B', 'C'], ', ', ' & ')
 * output : "A, B & C";
 * @param str
 * @param joinWith
 * @param endWith
 * @returns
 */
function smartJoin(str: string[], joinWith = ', ', endWith = ', ') {
  const last = str.pop();
  return `${str.join(joinWith)}${str.length ? endWith : ''}${last || ''}`;
}

export function toLanguageVersionString(languages: LanguageRecord) {
  return Object.entries(languages).map(([language, specs]) => {
    const types = [];

    if (specs.subtitle) {
      types.push(toLabel('subtitle', 'movieLanguageTypes'));
    }

    if (specs.dubbed) {
      types.push(toLabel('dubbed', 'movieLanguageTypes'));
    }

    if (specs.caption) {
      types.push(toLabel('caption', 'movieLanguageTypes'));
    }

    if (types.length) {
      return `${toLabel(language, 'languages')} ${smartJoin(types, ', ', ' & ')}`;
    }

  }).filter(d => d).join(', ');
}
