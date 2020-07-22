
export interface ExternalMedia {
  /** access url */
  url: string;
}

export function createExternalMedia(media?: Partial<ExternalMedia>): ExternalMedia {
  return {
    url: '',
    ...media,
  }
}

export interface HostedMedia extends ExternalMedia {
  /** firebase storage ref *(path)* */
  ref: string;
}

export interface HostedMediaFormValue extends HostedMedia {
  oldRef: string;
  blobOrFile: Blob | File;
  delete: boolean;
  fileName: string;
}

export function clearHostedMediaFormValue(formValue: HostedMediaFormValue): HostedMedia {
  return {
    url: formValue.url || '',
    ref: formValue.oldRef || '', // we don't want the new ref witch is maybe not yet uploaded
  };
}

export function createHostedMedia(media?: Partial<HostedMedia>): HostedMedia {
  return {
    url: '',
    ref: '',
    ...media,
  }
}

/**
 * This array contains the different image sizes.
 */
export const imgSizeDirectory = ['lg', 'md', 'xs'] as const;
export type ImgSizeDirectory = (typeof imgSizeDirectory)[number];

export type ImageSizes = Record<ImgSizeDirectory, number>;

export function getImgSize(ref: string) {
  if (ref.includes('avatar')) {
    return [50, 100, 300];
  } else if (ref.includes('logo')) {
    return [50, 100, 300];
  } else if (ref.includes('poster')) {
    return [200, 400, 600];
  } else if (ref.includes('banner')) {
    return [300, 600, 1200];
  } else if (ref.includes('still')) {
    return [50, 100, 200];
  } else {
    return [1024];
  }
}

export interface UploadData {
  /**
  * firebase storage upload path *(or ref)*,
  * @note **Make sure that the path param does not include the filename.**
  * @note **Make sure that the path ends with a `/`.**
  */
  path: string,
  data: Blob | File,
  fileName: string,
}
