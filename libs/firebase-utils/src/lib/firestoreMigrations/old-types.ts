import { Language, Territory } from "@blockframes/utils/static-model";
import { Cast, Crew, Producer, Credit } from "@blockframes/utils/common-interfaces";

export interface OldPromotionalElement {
  label: string,
  size?: ResourceSizes,
  ratio?: ResourceRatios,
  media: OldImgRef,
  language?: Language,
  country?: Territory,
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

// Interface at Date : 17 July 2020
interface MovieStakeholders {
  executiveProducer: Stakeholder[];
  coProducer: Stakeholder[];
  broadcasterCoproducer: Stakeholder[];
  lineProducer: Stakeholder[];
  distributor: Stakeholder[];
  salesAgent: Stakeholder[];
  laboratory: Stakeholder[];
  financier: Stakeholder[];
}

interface Stakeholder {
  firstName?: string,
  lastName?: string,
  avatar?: OldImgRef,
  logo?: OldImgRef;
  countries?: Territory[],
}

export interface OldMovieImgRefDocument {
  id: string,
  main: {
    stakeholders: MovieStakeholders,
    directors: Credit[],
  },
  promotionalElements : {
    banner: OldPromotionalElement,
    poster: Record<string, OldPromotionalElement>,
    presentation_deck: OldPromotionalElement,
    promo_reel_link: OldPromotionalElement,
    scenario: OldPromotionalElement,
    screener_link: OldPromotionalElement,
    still_photo: Record<string, OldPromotionalElement>,
    teaser_link: OldPromotionalElement,
    trailer_link: OldPromotionalElement,
    trailer: Record<string, OldPromotionalElement>,
  },
  salesCast: {
    cast: Cast[],
    crew: Crew[],
    producers: Producer[]
  }
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

export interface OldExternalMedia {
  url: string;
}
export interface OldHostedMedia extends OldExternalMedia{
  ref: string;
}

export function createOldHostedMedia(media?: Partial<OldHostedMedia>) {
  return {
    ref: media?.ref ?? '',
    url: media?.url ?? '',
  };
}

export interface OldNewPromotionalElement {
  label: string,
  size?: ResourceSizes,
  ratio?: ResourceRatios,
  media: OldHostedMedia,
  language?: Language,
  country?: Territory,
}

export function createOldNewPromotionalElement(
  promotionalElement: Partial<OldNewPromotionalElement> = {}
): OldNewPromotionalElement {
  return {
    label: '',
    ...promotionalElement,
    media: createOldHostedMedia(promotionalElement.media),
  };
}


const ResourceRatios = {
  '16/9': '16:9',
  '4/3': '4:3',
  round: 'Round',
  square: 'Square',
  rectangle: 'Rectangle'
};
type ResourceRatios = keyof typeof ResourceRatios;

const ResourceSizes = {
  medium: 'Medium',
  small: 'Small',
  large: 'Large',
  thumbnail: 'Thumbnail'
};
type ResourceSizes = keyof typeof ResourceSizes;
