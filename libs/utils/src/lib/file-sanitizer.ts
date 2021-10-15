export const privacies = ['public', 'protected'] as const;
export type Privacy = typeof privacies[number];
export const tempUploadDir = 'tmp';

export function deconstructFilePath(_filePath: string | undefined) {
  let filePath = _filePath;
  if (!filePath) {
    throw new Error('Upload Error : Undefined File Path');
  }

  const segments = filePath.split('/');

  if (segments.length < 4) {
    const error = `Upload Error : File Path ${filePath} is malformed.`;
    const solution = 'It should at least contain 3 slash.';
    const example = 'Example: public/collection/id/field/fileName';
    throw new Error(`${error} ${solution}\n${example}`);
  }

  const isTmp = segments[0] === tempUploadDir;
  // remove tmp/
  if (isTmp) {
    segments.shift();
    filePath = filePath.slice(`${tempUploadDir}/`.length);
  }

  // remove "protected/" or "public/"
  const privacy: Privacy = segments.shift() as Privacy;
  if (!privacies.includes(privacy)) {
    throw new Error(`Path '${segments.join('/')}' should start with privacy setting`);
  }

  const collection = segments.shift();
  const docId = segments.shift();

  if (!docId || !collection) {
    throw new Error('Invalid path pattern');
  }

  const docPath = `${collection}/${docId}`;

  // remove the file name at the end
  // `segments` is now only composed by the field to update
  segments.pop();

  const field = segments.join('.');

  return {
    isTmp,
    privacy,
    collection,
    docId,
    filePath,
    docPath,
    field
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
  let fileNameWithoutExt = fileParts.join('.').split(' ').join('-');
  // replace two or more dots by only one
  fileNameWithoutExt = fileNameWithoutExt.replace(/\.+/g, '.');

  return `${fileNameWithoutExt.substr(0, 100)}.${getFileExtension(str)}`;
}

/**
 * Cleans and returns the storage path
 * @dev example output:
 * public/users/123abc/avatar
 */
export function getStoragePath(path: string, privacy: Privacy = 'public'): string {
  if (!path) return '';

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

  if (!fileName || typeof fileName !== 'string') {
    console.warn('fileName is mandatory and must be a string!', fileName)
    return '';
  }

  // get the part after the last slash and remove url parameters like "#" and "?"
  const lastSlash = fileName.split('/').pop();
  const filePart = lastSlash !== undefined ? lastSlash.split(/#|\?/) : [];
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
