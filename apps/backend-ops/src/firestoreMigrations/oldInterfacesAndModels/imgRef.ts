import { ResourceSizesSlug, ResourceRatioSlug, LanguagesSlug, TerritoriesSlug } from '@blockframes/utils/static-model';

export function createOldPromotionalElement(
  promotionalElement: Partial<OldPromotionalElement> = {}
): OldPromotionalElement {
  return {
    label: '',
    ...promotionalElement,
    media: createOldImgRef(promotionalElement.media)
  };
}

export function createOldImgRef(ref: Partial<OldImgRef> | string = {}): OldImgRef {
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

interface OldPromotionalElement {
  label: string,
  size?: ResourceSizesSlug,
  ratio?: ResourceRatioSlug,
  media: OldImgRef,
  language?: LanguagesSlug,
  country?: TerritoriesSlug,
}

export interface OldImgRef {
  ref: string;
  urls: {
    original: string;
    fallback?: string;
    xs?: string;
    md?: string;
    lg?: string;
  };
}