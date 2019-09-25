/**
 * Generates a random string
 */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Cleans filename ( before firestore upload for example )
 * @param url 
 */
export function sanitizeFileName(url: string): string {
  // get the part after the last slash and remove url parameters like "#" and "?"
  const extension = url.split('/').pop().split(/\#|\?/)[0].split('.').pop();
  // generate a random filename
  const fileName = uuidv4();
  return `${fileName}.${extension}`;
}
