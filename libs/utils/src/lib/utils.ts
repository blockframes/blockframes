
import { Person } from './common-interfaces';

export interface ErrorResultResponse {
  error: string;
  result: any;
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
    extension: ['pdf'],
  },
  image: {
    mime: ['image/jpeg', 'image/png', 'image/webp'],
    extension: ['jpg', 'jpeg', 'png', 'webp'],
  },
  video: {
    mime: ['video/x-msvideo', 'video/x-matroska', 'video/mp4'],
    extension: ['avi', 'mkv', 'mp4'],
  },
  docx: {
    mime: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extension: ['doc', 'docx'],
  },
  xls: {
    mime: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.oasis.opendocument.spreadsheet'],
    extension: ['xls', 'xlsx', 'ods'],
  },
  json: {
    mime: ['application/json'],
    extension: ['json']
  },
  csv: {
    mime: ['text/csv'],
    extension: ['csv']
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

  // we use a for in loop so we can directly return when a match is found
  // (returning in a forEach just end the current iteration)
  for (const type in allowedFiles) {
    const match = allowedFiles[type].extension.some(fileExtension => fileExtension === extension);
    if (match) return type as AllowedFileType;
  }

  return 'unknown';
}

export async function loadJWPlayerScript(document: Document) {
  return new Promise(res => {
    const id = 'jwplayer-script';

    // check if the script tag already exists
    if (!document.getElementById(id)) {
      const script = document.createElement('script');
      script.setAttribute('id', id);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('src', 'https://cdn.jwplayer.com/libraries/lpkRdflk.js');
      document.head.appendChild(script);
      script.onload = () => {
        res();
      }
    } else {
      res(); // already loaded
    }
  });
}
