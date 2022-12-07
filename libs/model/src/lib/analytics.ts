import { MovieAvailsSearch } from './algolia';
import { DocumentMeta } from './meta';
import { Movie } from './movie';
import { Organization } from './organisation';
import { Module } from './static';
import { User } from './user';

const analyticsEvents = [
  'pageView',
  'promoElementOpened',
  'addedToWishlist',
  'removedFromWishlist',
  'screeningRequested',
  'askingPriceRequested',
  'exportedTitles',
  'filteredTitles',
  'savedFilters',
  'loadedFilters',
  'filteredAvailsCalendar',
  'filteredAvailsMap'
] as const;
export type EventName = typeof analyticsEvents[number];

export interface AnalyticsTypeRecord {
  title: MetaTitle;
  titleSearch: MetaTitleSearch;
}

export type AnalyticsTypes = keyof AnalyticsTypeRecord;

export interface Analytics<type extends AnalyticsTypes = AnalyticsTypes> {
  id: string;
  name: EventName;
  type: type;
  meta: AnalyticsTypeRecord[type];
  _meta?: DocumentMeta;
}

interface MetaTitle {
  titleId: string;
  orgId: string;
  uid: string;
  ownerOrgIds: string[];
}

interface MetaTitleSearch {
  search?: MovieAvailsSearch;
  module: Module,
  uid: string;
  orgId?: string;
  titleId?: string;
  ownerOrgIds?: string[];
  titleCount?: number;
  status: boolean;
}

export interface AnalyticsInteraction {
  count: number;
  first?: Date;
  last?: Date;
}

export interface AggregatedAnalytic extends Partial<Record<EventName, number>> {
  interactions: Record<'global' | 'festival' | 'catalog', AnalyticsInteraction>
  user?: User;
  org?: Organization;
  title?: Movie;
}

export interface AnalyticsWithOrg extends Analytics<AnalyticsTypes> {
  org?: Organization;
}

export interface AnalyticData {
  key: string;
  count: number;
  label: string;
}

// FireAnalytics
export interface AnalyticsUserProperties {
  browser_name: string;
  browser_version: string;
}

export function createTitleMeta(meta: Partial<MetaTitle>): MetaTitle {
  return {
    titleId: '',
    orgId: '',
    uid: '',
    ownerOrgIds: [],
    ...meta
  };
};

export function createTitleSearchMeta(meta: Partial<MetaTitleSearch>): MetaTitleSearch {
  return {
    module: 'marketplace',
    orgId: '',
    uid: '',
    status: true,
    ...meta
  };
};

export function createAggregatedAnalytic(analytic: Partial<AggregatedAnalytic>): AggregatedAnalytic {
  return {
    interactions: {
      global: { count: 0 },
      festival: { count: 0 },
      catalog: { count: 0 },
    },
    addedToWishlist: 0,
    askingPriceRequested: 0,
    pageView: 0,
    promoElementOpened: 0,
    removedFromWishlist: 0,
    screeningRequested: 0,
    ...analytic
  };
}
