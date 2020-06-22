export type ImgSizeDirectory = 'lg' | 'md' | 'xs';
export const imgSizeDirectory: ImgSizeDirectory[] = ['lg', 'md', 'xs'];

// TODO(#3088) blob, delete and path shouldnt be in firestore; these values are only used to determine what to do with the image on update of Form
export interface ImgRef {
  ref: string;
  urls: {
    original: string;
    fallback?: string;
    xs?: string;
    md?: string;
    lg?: string;
  };
  blob?: any;
  delete?: boolean;
  path?: string;
  fileName?: string;
}

export function createImgRef(ref: Partial<ImgRef> | string = {}): ImgRef {
  const _ref = typeof ref === 'string' ? { urls: { original: ref } } : ref;
  return {
    ref: '',
    urls: {
      original: '',
      xs: '',
      md: '',
      lg: '',
    },
    ..._ref
  };
}

export type ImageSizes = Record<ImgSizeDirectory, number>;

export function getImgSize(url: string): ImageSizes {
  if (url.includes('avatar')) {
    return { xs: 50, md: 100, lg: 300 };
  } else if (url.includes('logo')) {
    return { xs: 50, md: 100, lg: 300 };
  } else if (url.includes('poster')) {
    return { xs: 200, md: 400, lg: 600 };
  } else if (url.includes('banner')) {
    return { xs: 300, md: 600, lg: 1200 };
  } else if (url.includes('still')) {
    return { xs: 50, md: 100, lg: 200 };
  } else {
    throw new Error(`Unknown Image Format in ${url}, known format are ${imgSizeDirectory.join(', ')}`);
  }
}

export interface UploadFile {
  path: string,
  data: Blob,
  fileName: string,
}
