import { StorageFile } from './media';
import { App } from './static';

export interface CmsApp {
  id: string;
  pages: string[];
}

//////////////////
// TEMPLATE
//////////////////

export interface BannerSection extends Section {
  _type: 'banner',
  title: string;
  subtitle: string;
  description: string;
  background: StorageFile;
  image: StorageFile;
  links: Link[]
}

export interface HeroSection extends Section {
  _type: 'hero',
  title: string;
  description: string;
  background: StorageFile;
  links: Link[];
}

export interface OrgTitlesSection extends Section {
  _type: 'orgTitles',
  title: string;
  description: string;
  orgId: string;
  titleIds: string[];
  query: FirestoreQuery;
}

export interface OrgsSection extends Section {
  _type: 'orgs',
  title: string;
  link: string;
  orgIds: string[];
  query: FirestoreQuery;
}

export interface SliderSection extends Section {
  _type: 'slider',
  titleIds: string[];
  query: FirestoreQuery;
}

export interface EventsSliderSection extends Section {
  _type: 'eventsSlider';
  title: string;
  link: string;
  eventIds: string[];
  query: FirestoreQuery;
}

export interface TitlesSection extends Section {
  _type: 'titles',
  title: string;
  link: string;
  mode: 'poster' | 'banner';
  sorting: SortingOptions;
  titleIds: string[];
  query: FirestoreQuery;
}

export type HomeSection =
  | BannerSection
  | HeroSection
  | OrgTitlesSection
  | OrgsSection
  | SliderSection
  | TitlesSection
  | EventsSliderSection;

//////////////////
// TEMPLATE
//////////////////

export type CmsPage = CmsTemplate<HomeSection>;

export interface CmsTemplate<S extends Section = Section> {
  id: string;
  title: string;
  sections: S[]
}

export interface TemplateParams {
  app: App,
  page: string;
  template: string;
}

export interface Section {
  _type: string;
}


//////////////////
// UTILS
//////////////////

export const sortFn = {
  random: () => Math.random() - .5
}

export type SortingOptions = 'default' | keyof typeof sortFn;
export const sortingOptions: SortingOptions[] = ['default', 'random'];

export interface Link {
  text: string;
  path: string;
  type: 'basic' | 'flat' | 'stroked';
  color: 'primary' | 'accent' | 'warn' | '';
}

export type QueryMethods = 'where' | 'orderBy' | 'limit' | 'limitToLast' | 'startAt';
export interface CollectionQuery {
  method: QueryMethods;
}

export type Conditions = '<' | '<=' | '==' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any' | '!=';
export interface WhereQuery extends CollectionQuery {
  field: string;
  condition: Conditions;
  value: string | boolean | number;
}

export type Direction = 'desc' | 'asc';
export interface OrderByQuery extends CollectionQuery {
  field: string;
  direction: Direction
}

export interface LimitQuery extends CollectionQuery {
  limit: number
}

export interface StartAtQuery extends CollectionQuery {
  value: string | boolean | number;
}

export type FirestoreQuery = CollectionQuery[];