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
  const suffix = orgName.substring(0, 2).toLowerCase();
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += `${Math.floor(Math.random() * 10)}`;
  }
  return `${suffix}-${id}`;
}
