export type ImgSizeDirectory = 'lg' | 'md' | 'xs' | 'original';
export const imgSizeDirectory: ImgSizeDirectory[] = ['lg', 'md', 'xs', 'original']

export interface ImgRef {
  ref: string;
  urls: {
    original: string,
    xs?: string,
    md?: string,
    lg?: string
  };
}

export function createImgRef(ref: Partial<ImgRef> | string = {}): ImgRef {
  const _ref = typeof ref === 'string' ? { urls: { original: ref } } : ref;
  return {
    ref: '',
    urls: {
      original: '',
      xs: '',
      md: '',
      lg: ''
    },
    ..._ref
  };
}
