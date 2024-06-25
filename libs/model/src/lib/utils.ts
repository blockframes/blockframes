import { addYears, subYears } from 'date-fns';
import { Person } from './identity';
import { LanguageRecord } from './movie';
import { App, MovieCurrency, Scope, TerritoryISOA2Value, TimeFrame, staticModel, staticModeli18n, timeFrames, timeFramesi18n } from './static';

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
  location: 'file-uploader-service' | 'global' | 'notification-service' | 'movie-search';
  bugType: 'invalid-metadata' | 'network' | 'front-version' | 'jwplayer-api' | 'firebase-error' | 'algolia-error';
}

export interface RequestAskingPriceData {
  movieId: string;
  uid: string;
  territories: string;
  message?: string;
  medias?: string;
  exclusive?: boolean;
  app: App
}

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
  endWith?: string,
  lang?: SupportedLanguages
): string {
  if (!value) return '';
  if (!scope && typeof value === 'string') return value;
  try {
    const data = (lang && staticModeli18n[lang] && staticModeli18n[lang][scope]) ? staticModeli18n[lang][scope] : staticModel[scope];
    if (Array.isArray(value)) {
      return smartJoin(
        value.map((val) => data[val] || staticModel[scope][val]),
        joinWith,
        endWith
      );
    } else {
      return data[value] || staticModel[scope][value];
    }
  } catch (error) {
    console.error(`Could not find label for key "${value}" in scope "${scope}"`);
    if (typeof value === 'string') return value;
    return '';
  }
}

export function getTimeFrames(order: 'desc' | 'asc', lang?: SupportedLanguages): TimeFrame[] {
  return (lang && timeFramesi18n[lang] && timeFramesi18n[lang][order]) ?
    timeFramesi18n[lang][order] :
    timeFrames[order];
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

export const externalOrgIdentifier = 'External';

export type PricePerCurrency = Partial<Record<MovieCurrency, number>>;

export function getTotalPerCurrency(prices: { price: number, currency?: MovieCurrency }[] = []): PricePerCurrency {
  const totalPrice: PricePerCurrency = {};
  prices.filter(i => !!i.currency).forEach(i => {
    totalPrice[i.currency] ||= 0;
    totalPrice[i.currency] += i.price;
  });
  return totalPrice;
}

/**
 * Sorts array of objects
 * Field can be "foo.date" to access deep attributes
 * @param objects 
 * @returns 
 */
export function sortByDate<T>(objects: T[], field: string) {
  const resolve = (path: string, obj: T) => path.split('.').reduce((prev, curr) => prev?.[curr], obj);
  return objects.sort((a, b) => resolve(field, a).getTime() - resolve(field, b).getTime());
}

export const supportedLanguages = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
} as const;

export type SupportedLanguages = keyof typeof supportedLanguages;

export const defaultLocaleId = 'en-GB';

export const supportedLocaleIds = {
  'fr-FR': 'fr-FR',
  'en-US': 'en-US',
  'en-GB': 'en-GB',
  'es-ES': 'es-ES',
} as const;

const supportedIsoA2 = {
  'GB': 'GB',
  'FR': 'FR',
  'US': 'US',
  'ES': 'ES',
} as const;

export type SupportedLocaleIds = keyof typeof supportedLocaleIds;

function getNavigatorLanguage(): SupportedLanguages {
  switch (navigator.language) {
    case 'fr':
    case 'fr-FR':
      return 'fr';
    case 'es':
    case 'es-ES':
      return 'es';
    default:
      return defaultLocaleId.split('-')[0] as SupportedLanguages;
  }
}

function getNavigatorIsoA2(): TerritoryISOA2Value {
  if (Object.keys(supportedLocaleIds).includes(navigator.language)) return navigator.language.split('-')[1] as TerritoryISOA2Value;
  return getDefaultIsoA2(navigator.language);
}

export function getDefaultIsoA2(lang: string) {
  switch (lang) {
    case 'fr':
      return 'FR'
    case 'es':
      return 'ES';
    default:
      return defaultLocaleId.split('-')[1] as TerritoryISOA2Value;
  }
}

// Read locale from local storage or use browser language
export const preferredLanguage = (): SupportedLanguages => {
  const lang = localStorage.getItem('locale.lang') || getNavigatorLanguage();
  if (!supportedLanguages[lang]) return defaultLocaleId.split('-')[0] as SupportedLanguages;
  return lang as SupportedLanguages;
};

export const preferredIsoA2 = (): TerritoryISOA2Value => {
  const isoA2 = localStorage.getItem('locale.isoA2') || getNavigatorIsoA2();
  if (!supportedIsoA2[isoA2]) return defaultLocaleId.split('-')[1] as TerritoryISOA2Value;
  return isoA2 as TerritoryISOA2Value;
}

export const getUserLocaleId = (): SupportedLocaleIds => {
  const code = `${preferredLanguage()}-${preferredIsoA2()}`;
  if (!supportedLocaleIds[code]) return defaultLocaleId;
  return code as SupportedLocaleIds;
}