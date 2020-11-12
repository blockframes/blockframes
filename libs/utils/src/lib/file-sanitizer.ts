export const privacies = ['public', 'protected'] as const;
export type Privacy = typeof privacies[number];
export const tempUploadDir = 'tmp';

export function dissectFilePath(filePath: string | undefined) {
  if (!filePath) {
    throw new Error('Upload Error : Undefined File Path');
  }

  const filePathElements = filePath.split('/');

  if (filePathElements.length < 4) {
    const error = `Upload Error : File Path ${filePath} is malformed.`;
    const solution = 'It should at least contain 3 slash.';
    const example = 'Example: public/collection/id/field/fileName';
    throw new Error(`${error} ${solution}\n${example}`);
  }

  // remove tmp/
  let isInTmpDir = false;
  if (filePathElements[0] === tempUploadDir) {
    filePathElements.shift();
    filePath = filePathElements.join('/');
    isInTmpDir = true;
  }

  let security: string;
  // remove "protected/"" or "public/"
  if (privacies.includes(filePathElements[0] as any)) {
    security = filePathElements.shift();
  }

  const collection = filePathElements.shift();
  const docId = filePathElements.shift();

  if (!docId || !collection) {
    throw new Error('Invalid path pattern');
  }

  // remove the file name at the end
  // `filePathElements` is now only composed by the field to update
  filePathElements.pop();

  const fieldToUpdate = filePathElements.join('.');

  return {
    isInTmpDir,
    security,
    collection,
    docId,
    fieldToUpdate
  }
}

/**
 * Cleans filename ( before firestore upload for example )
 * @param str
 */
export function sanitizeFileName(str: string): string {
  const fileParts = str.split('.');
  // removes extension
  fileParts.pop();
  // replace spaces by "-"
  const fileNameWithoutExt = fileParts.join('.').split(' ').join('-');

  return `${fileNameWithoutExt.substr(0, 100)}.${getFileExtension(str)}`;
}

/**
 * Cleans and returns the storage path
 * @dev example output:
 * public/users/123abc/avatar
 */
export function getStoragePath(path: string, privacy: Privacy = 'public'): string {
  if(!path) return '';

  // Remove first trailing slash if any
  path = path[0] === '/' ? path.slice(1) : path;

  // Remove last trailing slash if any
  path = path[path.length - 1] === '/' ? path.slice(0, path.length - 1) : path;

  return `${privacy}/${path}`;
}

/**
 * Extract file extension
 * @param fileName
 */
export function getFileExtension(fileName: string) {
  // get the part after the last slash and remove url parameters like "#" and "?"
  const lastSlash = fileName.split('/').pop();
  const filePart = lastSlash !== undefined ? lastSlash.split(/\#|\?/) : [];
  return filePart.length > 0 ? filePart[0].split('.').pop() : '';
}

/**
 * @dev On some OS file.type is empty.
 * We have to guess it from extension.
 * @see https://github.com/danialfarid/ng-file-upload/issues/1211
 *
 * To add more supported extensions
 * @see https://developer.mozilla.org/fr/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
 *
 * @param file
 * */
export function getMimeType(file: File): string {
  if (!file.type) {
    switch (getFileExtension(file.name)) {
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'ods':
        return 'application/vnd.oasis.opendocument.spreadsheet';
      case 'csv':
        return 'text/csv';
      default:
        return 'text/html'
    }
  } else {
    return file.type;
  }
}
