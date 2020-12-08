import { Section } from "./template";
import { FirestoreQuery, Link } from './utils';

export interface BannerSection extends Section {
  title: string;
  subtitle: string;
  description: string;
  background: string;
  links: Link[]
}

export interface HeroSection extends Section {
  title: string;
  description: string;
  background: string;
  links: Link[];
}

export interface OrgTitlesSection extends Section {
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

export interface TitlesSection extends Section {
  _type: 'titles',
  title: string;
  link: string;
  mode: 'poster' | 'banner';
  titleIds: string[];
  query: FirestoreQuery;
}

export type HomeSection = 
  | BannerSection
  | HeroSection
  | OrgTitlesSection
  | OrgsSection
  | SliderSection
  | TitlesSection;