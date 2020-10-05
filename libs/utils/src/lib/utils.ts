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
