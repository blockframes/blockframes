
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
 * @note it **does not** contains the `original` key
 */
export const imgSizeDirectory = ['lg', 'md', 'xs', 'fallback'] as const;
export type ImgSizeDirectory = (typeof imgSizeDirectory)[number];

export interface ImgRef {
  original: HostedMedia;
  fallback: HostedMedia;
  xs?: HostedMedia;
  md?: HostedMedia;
  lg?: HostedMedia;
}

export function createImgRef(ref?: Partial<ImgRef>): ImgRef {
  return {
    original: createHostedMedia(ref?.original || {}),
    fallback: createHostedMedia(ref?.fallback || {}),
    xs: createHostedMedia(ref?.xs || {}),
    md: createHostedMedia(ref?.md || {}),
    lg: createHostedMedia(ref?.lg || {}),
  };
}

export type ImageSizes = Record<ImgSizeDirectory, number>;

export function getImgSize(url: string): ImageSizes {
  if (url.includes('avatar')) {
    return { xs: 50, md: 100, lg: 300, fallback: 1024 };
  } else if (url.includes('logo')) {
    return { xs: 50, md: 100, lg: 300, fallback: 1024 };
  } else if (url.includes('poster')) {
    return { xs: 200, md: 400, lg: 600, fallback: 1024 };
  } else if (url.includes('banner')) {
    return { xs: 300, md: 600, lg: 1200, fallback: 1024 };
  } else if (url.includes('still')) {
    return { xs: 50, md: 100, lg: 200, fallback: 1024 };
  } else {
    throw new Error(`Unknown Image Format in ${url}, known format are ${imgSizeDirectory.join(', ')}`);
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
