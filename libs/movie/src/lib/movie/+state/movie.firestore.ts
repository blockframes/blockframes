import { MovieStatusSlug, PromotionalElementTypesSlug, ResourceRatioSlug, ResourceSizesSlug, TerritoriesSlug, LanguagesSlug, MediasSlug } from "@blockframes/movie/movie/static-model";
import { DateRangeRaw } from "@blockframes/utils/date-range";
import { firestore } from "firebase/app";
import { ImgRef } from "@blockframes/utils/image-uploader";

type Timestamp = firestore.Timestamp;

export interface MovieVersionInfo {
  dubbings: string[],
  subtitles: string[],
}

interface MovieSalesAgentDealRaw<D> {
  rights: DateRangeRaw<D>;
  territories: string[],
  medias: string[],
  salesAgent?: Person,
  reservedTerritories?: string[],
}

export interface MovieSalesAgentDealDocumentWithDates extends MovieSalesAgentDealRaw<Date> {
}

export interface MoviePromotionalDescription {
  keyAssets: string[],
  keywords: string[],
}

export interface Prize {
  name: string,
  year: number,
  prize?: string,
  logo?: ImgRef,
}

export interface PromotionalElement {
  label: string,
  type: PromotionalElementTypesSlug,
  size?: ResourceSizesSlug,
  ratio?: ResourceRatioSlug,
  // Can be an imgRef if resource is stored on our side or a string for remote resource
  url: string | ImgRef 
}

export interface MoviePromotionalElements {
  images: ImgRef[], // @todo #1052 merge into promotional elements
  promotionalElements: PromotionalElement[],
}

export interface Title {
  original: string;
  international?: string;
}

/**
 * @TODO #1061 add description
 */
interface IdentityRaw {
  orgId?: string, // @todo #1052 merge credit & stakeholder interface ? or implements?
  displayName?: string, // @todo #1052 "?" is temporary
  showName?: boolean, // @todo #1052 merge credit & stakeholder interface ? or implements?
}

export interface Stakeholder extends IdentityRaw {
}

export function createStakeholder(params: Partial<Stakeholder> = {}): Stakeholder {
  return {
    orgId: '',
    ...params,
  }
}

export interface Person extends IdentityRaw {
  firstName: string, // @todo #1052 replace with displayName
  lastName?: string, // @todo #1052 replace with displayName
  creditRole?: string, // @todo #1052 rename to role
  logo?: ImgRef,
}

export interface MovieStory {
  synopsis: string,
  logline: string,
}

export interface MovieSalesCast {
  credits: Person[],
}

export interface MovieFestivalPrizes {
  prizes: Prize[]
}

export interface MovieBudget {
  totalBudget: string, // WIP #1052 use Price Interface?
  budgetCurrency?: string, // WIP #1052
  detailledBudget?: any // WIP #1052
}

export interface MovieLanguageSpecification {
  original: boolean;
  dubbed: boolean;
  subtitle: boolean;
}

// Distribution deal raw interface, formerly called MovieSaleRaw
interface DistributionDealRaw<D> {
  id: string,
  licensee: Stakeholder,
  licensor: Stakeholder,
  operatorName: string;
  showOperatorName: boolean; //@todo #581 Promotional Distribution Deal
  rights: DateRangeRaw<D>; // duration: DateRange; => now use Term ?
  territories: TerritoriesSlug[];
  medias: MediasSlug[];
  dubbings: { [language in LanguagesSlug]: MovieLanguageSpecification };
  subtitles: string[]; // @todo #1061 remove (overlapping dubbings)
  exclusive: boolean;
  price: number;
}

export interface DistributionDealDocumentWithDates extends DistributionDealRaw<Date> {
}

export interface MovieMain {
  internalRef?: string,
  isan?: string,
  title: Title,
  directors?: Person[],
  poster?: ImgRef,
  productionYear?: number,
  genres?: string[],
  originCountries?: string[],
  languages?: string[],
  status?: MovieStatusSlug,
  productionCompanies?: Person[],
  length?: number,
  shortSynopsis?: string,
}

interface MovieSalesInfoRaw<D> {
  scoring: string,
  color: string,
  europeanQualification: boolean,
  pegi: string,
  certifications: string[],
  internationalPremiere: Prize,
  originCountryReleaseDate: D,
  broadcasterCoproducers: string[],
  theatricalRelease: boolean,
}

export interface MovieSalesInfoDocumentWithDates extends MovieSalesInfoRaw<Date> {
}

/** Generic interface of a Movie */
interface MovieRaw<D> {
  // @todo #643 add new fields to Draw.io
  _type: 'movies';
  id: string;

  // @todo #643 not main movie attributes WIP
  deliveryIds: string[];
  ipId?: string;
  directorNote?: string;
  producerNote?: string;
  goalBudget?: number; // @todo #1052 remove ?
  movieCurrency?: string;
  fundedBudget?: number;
  breakeven?: number;
  backendProfit?: number;
  potentialRevenues?: number;
  selectionCategories?: string;

  // Sections
  main: MovieMain;
  story: MovieStory;
  promotionalElements: MoviePromotionalElements;
  promotionalDescription: MoviePromotionalDescription;
  salesCast: MovieSalesCast;
  salesInfo: MovieSalesInfoRaw<D>;
  versionInfo: MovieVersionInfo;
  festivalPrizes: MovieFestivalPrizes;
  salesAgentDeal: MovieSalesAgentDealRaw<D>;
  budget: MovieBudget;
}

/** Document model of a Movie */
export interface MovieDocument extends MovieRaw<Timestamp> {
}

/** Document model of a Movie with Dates (type Date) */
export interface MovieDocumentWithDates extends MovieRaw<Date> {
}

/** Public interface of a movie (to notifications). */
export interface PublicMovie {
  id: string;
  title: Title;
}
