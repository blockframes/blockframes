export interface ErrorResultResponse {
  error: string;
  result: any;
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


export const allowedVideoFilesTypes = ['video/x-msvideo', 'video/x-matroska', 'video/mp4'];
export const allowedVideoFilesExtensions =  ['.avi', '.mkv', '.mp4'];

export function isAllowedVideoFileType(type: string) {
  return allowedVideoFilesTypes.some(fileType => fileType === type);
}

export function isAllowedVideoFileExtension(extension: string) {
  return allowedVideoFilesExtensions.some(fileExtension => fileExtension === extension);
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
