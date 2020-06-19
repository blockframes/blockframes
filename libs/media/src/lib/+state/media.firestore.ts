export type ImgSizeDirectory = 'lg' | 'md' | 'xs' | 'original' | 'fallback';
export const imgSizeDirectory: ImgSizeDirectory[] = ['lg', 'md', 'xs', 'original', 'fallback'];

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

export interface ImageSizes {
  original: number;
  xs: number;
  md: number;
  lg: number;
}

export function getImgSize(url: string): ImageSizes {
  if (url.includes('avatar')) {
    return { original: 0, xs: 50, md: 100, lg: 300, fallback: 1024 };
  } else if (url.includes('logo')) {
    return { original: 0, xs: 50, md: 100, lg: 300, fallback: 1024 };
  } else if (url.includes('poster')) {
    return { original: 0, xs: 200, md: 400, lg: 600, fallback: 1024 };
  } else if (url.includes('banner')) {
    return { original: 0, xs: 300, md: 600, lg: 1200, fallback: 1024 };
  } else if (url.includes('still')) {
    return { original: 0, xs: 50, md: 100, lg: 200, fallback: 1024 };
  } else {
    throw new Error('No bucket directory, exiting function');
  }
}

export interface UploadFile {
  path: string,
  data: Blob,
  fileName: string,
}
