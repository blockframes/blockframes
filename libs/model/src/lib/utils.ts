import { addYears, subYears } from 'date-fns';
import { Person } from './identity';
import { LanguageRecord } from './movie';
import { App, Scope, staticModel } from './static';

export interface ErrorResultResponse {
  error: string;
  result: any;
}

export interface FormSaveOptions {
  publishing: boolean;
}

export interface RouteDescription {
  path: string;
  label: string;
  icon?: string;
  shouldHide?: boolean;
  /** List of the keys required by the movie or organization to display the page */
  requireKeys?: string[],
  disclaimer?: string;
}

export interface SentryError {
  message: string;
  location: 'file-uploader-service' | 'global' | 'notification-service';
  bugType: 'invalid-metadata' | 'network' | 'front-version' | 'jwplayer-api' | 'firebase-error' | 'animations'
}

export interface RequestAskingPriceData {
  movieId: string;
  uid: string;
  territories: string;
  message?: string;
  medias?: string;
  exclusive?: boolean;
  app: App
};

/**
 * replaces accented characters with their closes neighbour
 * in english characters
 * @link https://stackoverflow.com/a/37511463/6441976
 */
export function removeAccent<T>(str: T) {
  if (typeof str === 'string') return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  return str;
}

export function titleCase(text: string) {
  if (!text) return '';
  return text[0].toUpperCase() + text.substring(1);
}

/**
 * Trims a string without cropping the last word if keepLastWordComplete is set to true
 * Origin : libs\utils\src\lib\pipes\max-length.pipe.ts
 */
export function trimString(string: string, length: number, keepLastWordComplete?: boolean) {
  if (!string?.length || string.length <= length) return string;

  let trimmedString = string.substr(0, length);
  if (keepLastWordComplete) {
    const lastWordIndex = Math.min(trimmedString.length, trimmedString.lastIndexOf(' '));
    trimmedString = trimmedString.substr(0, lastWordIndex);
  }
  return `${trimmedString}...`;
}

export function displayName(person: Person) {
  return `${titleCase(person.firstName).trim()} ${titleCase(person.lastName).trim()}`;
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
};

export const allowedFileType = ['pdf', 'image', 'video', 'docx', 'xls', 'json', 'csv'] as const;
export type AllowedFileType = typeof allowedFileType[number];

export interface FileDefinition {
  mime: string[];
  extension: string[];
}
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
    mime: [
      'video/x-msvideo',
      'video/x-matroska',
      'video/mp4',
      'video/3gpp',
      'video/quicktime',
      'video/x-ms-wmv',
    ],
    /** @dev if updated, also update libs/devops/src/lib/emulator.ts */
    extension: ['.avi', '.mkv', '.mp4', '.3gp', '.mov', '.wmv', '.m4v'],
  },
  docx: {
    mime: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    extension: ['.doc', '.docx'],
  },
  xls: {
    mime: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',
    ],
    extension: ['.xls', '.xlsx', '.ods'],
  },
  json: {
    mime: ['application/json'],
    extension: ['.json'],
  },
  csv: {
    mime: ['text/csv'],
    extension: ['.csv'],
  },
};

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
    const match = allowedFiles[type].extension.some(
      (fileExtension) => fileExtension === dotExtension
    );
    if (match) return type as AllowedFileType;
  }

  return 'unknown';
}

export async function loadJWPlayerScript(document: Document, playerUrl: string) {
  return new Promise<void>((res) => {
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
      };
    } else {
      // script tag exists
      const script = document.getElementById(id) as HTMLScriptElement;
      const loaded = script.getAttribute('data-loaded');

      if (loaded === 'true') {
        // already loaded
        res();
      } else {
        // script tag exist but hasn't finished to load yet: check every 0,1s if it has finished
        let ttl = 50; // 50 x 0,1s = 5s
        const intervalId = window.setInterval(() => {
          if (ttl <= 0) {
            // abort after 5s
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
export function getWatermark(email = '', firstName = '', lastName = '') {
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

export function toLabel(
  value: string | string[],
  scope: Scope,
  joinWith?: string,
  endWith?: string
): string {
  if (!value) return '';
  try {
    if (Array.isArray(value)) {
      return smartJoin(
        value.map((val) => staticModel[scope][val]),
        joinWith,
        endWith
      );
    } else {
      return staticModel[scope][value];
    }
  } catch (error) {
    console.error(`Could not find label for key "${value}" in scope "${scope}"`);
    if (typeof value === 'string') return value;
    return '';
  }
}

/**
 * Example with (['A', 'B', 'C'], ', ', ' & ')
 * output : "A, B & C";
 * @param str
 * @param joinWith
 * @param endWith
 * @returns
 */
export function smartJoin(str: string[], joinWith = ', ', endWith = ', ') {
  const last = str.pop();
  return `${str.join(joinWith)}${str.length ? endWith : ''}${last || ''}`;
}

export function toLanguageVersionString(languages: LanguageRecord) {
  return Object.entries(languages)
    .map(([language, specs]) => {
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
    })
    .filter((d) => d)
    .join(', ');
}

export function sum(array: number[]): number
export function sum<T>(array: T[], getAmount: (item: T) => number): number
export function sum<T>(array: T[], getAmount?: (item: T) => number): number {
  const cb = getAmount || ((item: number) => item);
  return array.reduce((total, item) => total + cb(item as any), 0);
}

function createDateSetToMidnight() {
  const date = new Date(); //--/--/--:--:--:--
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());//--/--/--:0:0:0:0
}

/**
 * Get the date of the decoded url and set it 
 */
export function decodeDate(date: string | Date): Date {
  if (!date || date === 'now') return createDateSetToMidnight();
  if (date === 'nextYear') return addYears(createDateSetToMidnight(), 1);
  if (date === 'lastYear') return subYears(createDateSetToMidnight(), 1);
  return new Date(date);
}

export const deletedIdentifier = {
  user: '(Deleted User)',
  org: '(Deleted Org)',
  title: '(Deleted Title)'
}