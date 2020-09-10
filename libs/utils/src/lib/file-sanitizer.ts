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
