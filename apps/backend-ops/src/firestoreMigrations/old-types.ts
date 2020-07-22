import { ResourceSizesSlug, ResourceRatioSlug, LanguagesSlug, TerritoriesSlug } from "@blockframes/utils/static-model";

export interface OldPromotionalElement {
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

export interface OldPublicUser {
  uid: string;
  email: string;
  avatar?: OldImgRef;
  watermark?: OldImgRef;
  firstName?: string;
  lastName?: string;
  orgId?: string;
}

export interface OldPublicOrganization {
  id: string;
  denomination: OldDenomination;
  logo: OldImgRef;
}

export interface OldDenomination {
    full: string;
    public?: string;
}

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

