import { MovieSearch } from './algolia';
import { DocumentMeta } from './meta';
import { Movie } from './movie';
import { Organization } from './organisation';
import { App, Module } from './static';
import { createPublicUser, PublicUser, User } from './user';
import { AnonymousCredentials } from './identity';
import { AvailsFilter, CalendarAvailsFilter, MapAvailsFilter } from './avail';
import { sortByDate } from './utils';

const analyticsEvents = [
  // Title type
  'pageView',
  'promoElementOpened',
  'addedToWishlist',
  'removedFromWishlist',
  'screeningRequested',
  'askingPriceRequested',
  'screenerRequested',

  // Organization type
  'orgPageView',

  // TitleSearch type
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
  organization: MetaOrganization
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

export interface MovieMixedSearch {
  search?: MovieSearch;
  avails?: AvailsFilter | CalendarAvailsFilter | MapAvailsFilter;
}

interface MetaTitleSearch {
  search?: MovieMixedSearch;
  module: Module,
  uid: string;
  orgId: string;
  titleId?: string;
  ownerOrgIds?: string[];
  titleCount?: number;
  status: boolean;
}

interface MetaOrganization {
  organizationId: string;
  uid: string;
  orgId?: string;
  profile: PublicUser | AnonymousCredentials
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
}

export function createTitleSearchMeta(meta: Partial<MetaTitleSearch>): MetaTitleSearch {
  return {
    module: 'marketplace',
    orgId: '',
    uid: '',
    status: true,
    ...meta
  };
}

export function createOrganizationMeta(meta: Partial<MetaOrganization>): MetaOrganization {
  return {
    organizationId: '',
    uid: '',
    ...meta,
    profile: createPublicUser(meta.profile),
  };
}

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
    orgPageView: 0,
    promoElementOpened: 0,
    removedFromWishlist: 0,
    screeningRequested: 0,
    screenerRequested: 0,
    exportedTitles: 0,
    filteredTitles: 0,
    savedFilters: 0,
    loadedFilters: 0,
    filteredAvailsCalendar: 0,
    filteredAvailsMap: 0,
    ...analytic
  };
}

const isTitleAnalytics = (analytic: Analytics): analytic is Analytics<'title'> => analytic.type === 'title';
const isTitleSearchAnalytics = (analytic: Analytics): analytic is Analytics<'titleSearch'> => analytic.type === 'titleSearch';
const isOrganizationAnalytics = (analytic: Analytics): analytic is Analytics<'organization'> => analytic.type === 'organization';

/**
 * Filter out analytics events created by owner of movie or organization
 * @param analytics 
 * @returns 
 */
export function filterOwnerEvents<K extends keyof AnalyticsTypeRecord>(analytics: Analytics<K>[]): Analytics<K>[] {
  return analytics.filter(analytic => {
    if (isTitleAnalytics(analytic)) return !analytic.meta.ownerOrgIds?.includes(analytic.meta.orgId);
    if (isTitleSearchAnalytics(analytic)) return analytic.meta.titleId ? !analytic.meta.ownerOrgIds?.includes(analytic.meta.orgId) : true;
    if (isOrganizationAnalytics(analytic)) return analytic.meta.organizationId !== analytic.meta.orgId;
    return false; // Unknown analytics type..
  });
}

export function isBuyer(org: Organization, app: App = 'festival') {
  return org && !org.appAccess[app].dashboard;
}

export function removeSellerData(orgs: Organization[], analytics: Analytics<'title' | 'organization'>[], users: User[]) {
  const buyerOrgs = orgs.filter(org => isBuyer(org));
  const buyerOrgIds = buyerOrgs.map(({ id }) => id);
  const buyerAnalytics = analytics.filter(({ meta }) => buyerOrgIds.includes(meta.orgId));
  const buyerUsers = buyerAnalytics.map(({ meta }) => meta.uid);
  const filteredUsers = users.filter(({ uid }) => buyerUsers.includes(uid));
  return { users: filteredUsers, orgs: buyerOrgs, analytics: buyerAnalytics };
}

export function aggregate(analytics: Analytics[], data: Partial<AggregatedAnalytic> = {}) {
  const aggregated = createAggregatedAnalytic(data);
  for (const analytic of analytics) {
    aggregated[analytic.name]++;
  }

  aggregated.interactions.global = aggregateInteractions(analytics);
  aggregated.interactions.festival = aggregateInteractions(analytics.filter(a => a._meta.createdFrom === 'festival'));
  aggregated.interactions.catalog = aggregateInteractions(analytics.filter(a => a._meta.createdFrom === 'catalog'));

  return aggregated;
}

function aggregateInteractions(analytics: Analytics[]): AnalyticsInteraction {
  const sorted = sortByDate(analytics, '_meta.createdAt');
  return {
    count: sorted.length,
    first: sorted[0] ? sorted[0]._meta.createdAt : undefined,
    last: sorted[sorted.length - 1] ? sorted[sorted.length - 1]._meta.createdAt : undefined,
  };
}