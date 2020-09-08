/**
 * Cleans filename ( before firestore upload for example )
 * @param str
 */
export function sanitizeFileName(str: string): string {
  const rand = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 3);

  const fileParts = str.split('.');
  fileParts.pop();
  const fileNameWithoutExt = fileParts.join('.')
    .split(' ')
    .join('-');

  // generate a random part for filename
  // this allow us to prevent "update" in rules, only "create" is allowed.
  return `${fileNameWithoutExt.substr(0, 96)}-${rand}.${getFileExtension(str)}`;
}

export function getStoragePath(path: string, protectedMedia = false): string {
  // Remove first trailing slash if any
  path = path.indexOf('/') === 0 ? path.slice(1) : path;

  // Add last traling slash if missing
  path = path[path.length - 1] !== '/' ? `${path}/` : path;

  return `${protectedMedia ? 'protected/' : 'public/'}${path}`;
}

/**
 * Extract file extension
 * @param fileName
 */
function getFileExtension(fileName: string) {
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
