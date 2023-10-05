import { Analytics, AnalyticsTypeRecord, aggregate, filterOwnerEvents } from './analytics';
import { Organization, getOrgModuleAccess } from './organisation';
import { CrmUser, PublicUser, User, getMemberRole } from './user';
import { Permissions } from './permissions';
import { getAllAppsExcept } from './apps';
import { Language, appName, modules, toGroupLabel } from './static';
import { format } from 'date-fns';
import { CrmMovie, Movie, MovieLanguageSpecification } from './movie';
import { deletedIdentifier, displayName, smartJoin, sum, toLabel } from './utils';
import { CrmEvent } from './event';
import { DetailedContract } from './contract';
import { getNegotiationStatus } from './negociation';
import { CrmOffer } from './offer';
import { CrmBucket } from './bucket';
import { AnonymousCredentials } from './identity';
import { AvailsFilter } from './avail';
import { maxBudget } from './algolia';
import { getTotalIncome } from './income';

type ExportType = 'csv' | 'airtable';

interface GetDate {
  date: Date;
  exportType: ExportType;
  nullValue: string | null;
  nullCsv?: string; // when null for csv should not be '--'
}

const csvDate = (d: Date) => format(d, 'MM/dd/yyyy');

function getDate({ date, exportType, nullValue, nullCsv }: GetDate) {
  if (!date) return exportType === 'csv' ? nullCsv || nullValue : nullValue;
  if (exportType === 'csv') return csvDate(date);
  if (exportType === 'airtable') return date;
}

const apps = getAllAppsExcept(['crm']);

const getPrice = (sale: DetailedContract) => {
  if (sale.buyerId) {
    return `${sale.negotiation?.price || ''} ${sale.negotiation?.currency || ''}`;
  } else {
    const totalIncome = getTotalIncome(sale.incomes);
    const incomes = [];
    if (totalIncome.EUR) incomes.push(`${totalIncome.EUR} 'EUR'`);
    if (totalIncome.USD) incomes.push(`${totalIncome.USD} 'USD'`);
    return incomes.join(' | ');
  }
}

//* Export functions

export function crmUsersToExport(
  CRMusers: CrmUser[],
  analytics: Analytics<keyof AnalyticsTypeRecord>[],
  permissions: Permissions[],
  exportType: ExportType
) {
  const nullValue = exportType === 'csv' ? '--' : null;
  const rows = CRMusers.map(r => {
    const userAnalytics = analytics.filter(analytic => analytic.meta.uid === r.uid);
    const a = aggregate(userAnalytics);
    const type = r.org ? (getOrgModuleAccess(r.org).includes('dashboard') ? 'seller' : 'buyer') : nullValue;
    const role = getMemberRole(r, permissions);
    const row = {
      userId: r.uid,
      'first name': r.firstName || nullValue,
      'last name': r.lastName || nullValue,
      organization: r.org?.name || nullValue,
      'org id': r.orgId || nullValue,
      'org status': r.org?.status || nullValue,
      type: type || nullValue,
      country: r.org?.addresses.main.country || nullValue,
      role: role || nullValue,
      position: r.position || nullValue,
      'org activity': r.org?.activity || nullValue,
      email: r.email || nullValue,
      'first connection': r.firstConnection || nullValue,
      'last connection': r.lastConnection || nullValue,
      'page view': r.pageView || nullValue,
      'session count': r.sessionCount || nullValue,
      'created from': r.createdFrom || nullValue,
      'buying preferences language': r.preferences?.languages.join(', ') || nullValue,
      'buying preferences genres': r.preferences?.genres.join(', ') || nullValue,
      'buying preferences medias': r.preferences?.medias.join(', ') || nullValue,
      'buying preferences territories': r.preferences?.territories.join(', ') || nullValue,

      'total interactions': a.interactions.global.count,
      'interactions on catalog': a.interactions.catalog.count,
      'interactions on festival': a.interactions.festival.count,
      'first interaction on catalog': getDate({ date: a.interactions.catalog.first, exportType, nullValue }),
      'last interaction on catalog': getDate({ date: a.interactions.catalog.last, exportType, nullValue }),
      'last interaction on festival': getDate({ date: a.interactions.festival.last, exportType, nullValue }),
      'line-up views': a.orgPageView,
      'title views': a.pageView,
      'exported Titles': a.exportedTitles,
      'filtered Titles': a.filteredTitles,
      'saved Filters': a.savedFilters,
      loadedFilters: a.loadedFilters,
      'filtered Avails Calendar': a.filteredAvailsCalendar,
      'filtered Avails Map': a.filteredAvailsMap,
    };

    for (const a of apps) {
      for (const module of modules) {
        row[`${appName[a]} - ${module}`] = r.org?.appAccess[a]?.[module] ? true : false;
      }
    }
    return row;
  });
  return rows;
}

export function orgsToExport(orgs: Organization[], exportType: ExportType) {
  const nullValue = exportType === 'csv' ? '--' : null;
  const rows = orgs.map(r => {
    const row = {
      id: r.id,
      name: r.name,
      status: r.status,
      created: getDate({ date: r._meta?.createdAt, exportType, nullValue }),
      country: r.addresses.main.country || nullValue,
      email: r.email,
      memberCount: r.userIds.length,
      activity: r.activity || nullValue,
    };

    for (const a of apps) {
      for (const module of modules) {
        row[`${appName[a]} - ${module}`] = r.appAccess[a]?.[module] ? true : false;
      }
    }

    return row;
  });
  return rows;
}

export function crmMoviesToExport(movies: CrmMovie[], exportType: ExportType) {
  const nullValue = exportType === 'csv' ? '--' : null;
  const getLanguage = (m: CrmMovie, key: keyof MovieLanguageSpecification) => {
    const result: Language[] = [];
    for (const [language, specification] of Object.entries(m.languages)) {
      if (specification[key]) result.push(language as Language);
    }
    return toLabel(result, 'languages');
  };

  const rows = movies.map(m => ({
    'movie id': m.id,
    title: m.title.international,
    'season number': m.title.series || nullValue,
    'internal ref': m.internalRef || nullValue,
    org: m.org.name || nullValue,
    orgId: m.org?.id || nullValue,
    'catalog status': m.app.catalog.status,
    'catalog access': m.app.catalog.access,
    'festival status': m.app.festival.status,
    'festival access': m.app.festival.access,
    'financiers status': m.app.financiers.status,
    'financiers access': m.app.financiers.access,
    screeningCount: m.screeningCount,
    'creation date': getDate({ date: m._meta.createdAt, exportType, nullValue }),
    'last modification date': getDate({ date: m._meta.updatedAt, exportType, nullValue }),
    'audience goals': m.audience?.goals?.length ? smartJoin(m.audience.goals) : '',
    'audience targets': toLabel(m.audience?.targets, 'socialGoals'),
    cast: smartJoin(m.cast.map(person => displayName(person))),
    'content type': toLabel(m.contentType, 'contentType'),
    crew: smartJoin(m.crew.map(person => displayName(person))),
    directors: smartJoin(m.directors.map(person => displayName(person))),
    'estimated budget': toLabel(`${m.estimatedBudget}`, 'budgetRange'),
    'expected premiere': m.expectedPremiere?.event
      ? `${m.expectedPremiere.event} (${getDate({ date: m.expectedPremiere?.date, exportType, nullValue, nullCsv: 'no date' })})`
      : '',
    format: m.format ? toLabel(m.format, 'movieFormat') : '',
    'format quality': toLabel(m.formatQuality, 'movieFormatQuality'),
    genres: toLabel(m.genres, 'genres'),
    'custom genres': m.customGenres ? smartJoin(m.customGenres) : '',
    'is orignal version available': m.isOriginalVersionAvailable,
    'key assets': m.keyAssets,
    keywords: m.keywords ? smartJoin(m.keywords) : '',
    'languages dubbed': getLanguage(m, 'dubbed'),
    'languages subtitled': getLanguage(m, 'subtitle'),
    'languages captioned': getLanguage(m, 'caption'),
    logline: m.logline,
    'original languages': toLabel(m.originalLanguages, 'languages'),
    'origin countries': toLabel(m.originCountries, 'territories'),
    prizes: smartJoin(m.prizes.map(prize => prize.name)),
    'custom prizes': smartJoin(m.customPrizes.map(prize => prize.name)),
    certifications: toLabel(m.certifications, 'certifications'),
    producers: smartJoin(m.producers.map(person => displayName(person))),
    'production status': toLabel(m.productionStatus, 'productionStatus'),
    rating: smartJoin(
      m.rating.map(rate => `${rate.value} (${rate.country ? toLabel(rate.country, 'territories') : 'no country'})`)
    ),
    release: `${m.release.status} ${m.release?.year ? m.release.year : ''}`,
    'release media': smartJoin(m.releaseMedias),
    'running time': m.runningTime?.time,
    'running time status': m.runningTime?.status,
    'running time episode count': m.runningTime?.episodeCount,
    scoring: toLabel(m.scoring, 'scoring'),
    'shooting date completed': m.shooting?.dates?.completed,
    'shooting date progress': m.shooting?.dates?.progress,
    'shooting planned': !!m.shooting?.dates?.planned?.from,
    'shooting locations': m.shooting?.locations?.length
      ? smartJoin(
          m.shooting?.locations?.map(location => `${toLabel(location.country, 'territories')} (${smartJoin(location.cities)})`)
        )
      : '',
    'sound format': toLabel(m.soundFormat, 'soundFormat'),
    'production companies': smartJoin(m.stakeholders.productionCompany.map(company => company.displayName)),
    'co-production companies': smartJoin(m.stakeholders.coProductionCompany.map(company => company.displayName)),
    'broadcaster co-producer': smartJoin(m.stakeholders.broadcasterCoproducer.map(company => company.displayName)),
    'line producer': smartJoin(m.stakeholders.lineProducer.map(company => company.displayName)),
    distributor: smartJoin(m.stakeholders.distributor.map(company => company.displayName)),
    'sales agent': smartJoin(m.stakeholders.salesAgent.map(company => company.displayName)),
    laboratory: smartJoin(m.stakeholders.laboratory.map(company => company.displayName)),
    financier: smartJoin(m.stakeholders.financier.map(company => company.displayName)),
    synopsis: m.synopsis,
    orgIds: smartJoin(m.orgIds),
    'campaign started': getDate({ date: m.campaignStarted, exportType, nullValue }),

    'has poster': !!m.poster?.storagePath,
    'has banner': !!m.banner?.storagePath,
    'has stills': !!m.promotional.still_photo?.some(s => s.storagePath),

    'has screener': !!m.promotional?.videos?.screener?.jwPlayerId,
    'has public screener': !!m.promotional?.videos?.publicScreener?.jwPlayerId,
    'has salesPitch': !!m.promotional?.videos?.salesPitch?.jwPlayerId,
    'has otherVideo': !!m.promotional?.videos?.otherVideo?.jwPlayerId,

    'has avails': !!m.mandate?.id,
  }));

  return rows;
}

export function crmEventsToExport(events: CrmEvent[]) {
  const rows = events.map(e => ({
    'event id': e.id,
    'event name': e.title,
    'event type': e.type,
    'start date': e.start,
    'end date': e.end,
    'hosted by': e.hostedBy,
    'host id': e.ownerOrgId,
    invited: e.invited,
    confirmed: e.confirmed,
    pending: e.pending,
    attended: e.attended,
    accessibility: e.accessibility,
    'hidden on marketplace': e.isSecret,
  }));
  return rows;
}

export function mandatesToExport(mandates: DetailedContract[], exportType: ExportType) {
  const nullValue = exportType === 'csv' ? '--' : null;
  const rows = mandates.map(m => {
    const row = {
      type: 'mandate',
      internal: nullValue,
      id: m.id,
      date: getDate({ date: m._meta.createdAt, exportType, nullValue }),
      licensor: m.licensor,
      licensee: m.licensee,
      title: m.title,
      status: toLabel(m.status, 'contractStatus'),
      price: '',
    };
    return row;
  });
  return rows;
}

export function salesToExport(sales: DetailedContract[], exportType: ExportType) {
  const nullValue = exportType === 'csv' ? '--' : null;
  const rows = sales.map(s => {
    const row = {
      type: 'sale',
      internal: s.buyerId ? 'yes' : 'no',
      id: s.id,
      date: getDate({ date: s._meta.createdAt, exportType, nullValue }),
      licensor: s.licensor,
      licensee: s.licensee,
      title: s.title,
      status: toLabel(s.buyerId ? getNegotiationStatus(s.negotiation) : s.status, 'contractStatus'),
      price: getPrice(s),
    };
    return row;
  });
  return rows;
}

export function crmOffersToExport(offers: CrmOffer[], exportType: ExportType) {
  const nullValue = exportType === 'csv' ? '--' : null;
  const rows = offers.map(o => {
    const row = {
      reference: o.id,
      created: getDate({ date: o._meta.createdAt, exportType, nullValue }),
      buyerId: o.buyerId,
      '# of title': o.contracts.length,
      titles: o.contracts.map(c => c.title?.title?.international).join(', '),
      'specific terms': o.specificity ? true : nullValue,
      'total package price': `${sum(o.contracts.map(c => c.negotiation.price).filter(value => typeof value === 'number'))} ${
        o.currency || ''
      }`,
      status: toLabel(o.status, 'offerStatus'),
    };
    return row;
  });
  return rows;
}

export function crmBucketsToExport(crmBuckets: CrmBucket[], exportType: ExportType) {
  const nullValue = exportType === 'csv' ? '--' : null;
  const rows = crmBuckets.map(b => {
    const row = {
      'bucket reference': b.id,
      'org name': b.org ? b.org.name : deletedIdentifier.org,
      '# of title': b.contracts.length,
      specificity: b.specificity || nullValue,
      'total bucket price': `${sum(b.contracts.map(c => c.price).filter(value => typeof value === 'number' && !isNaN(value)))} ${
        b.currency || ''
      }`,
    };
    return row;
  });
  return rows;
}

export function titleAnalyticsToExport(
  users: CrmUser[],
  analytics: Analytics<'title' | 'titleSearch'>[],
  titles: Movie[],
  titleIds: string[],
  orgs: Organization[],
  exportType: ExportType
) {
  const nullValue = exportType === 'csv' ? '--' : null;
  const rows = [];
  for (const user of users) {
    const userAnalytics = analytics.filter(analytic => analytic.meta.uid === user.uid);
    const titleIdsWithAnalytics = titleIds.filter(id => userAnalytics.some(analytic => analytic.meta.titleId === id));
    for (const id of titleIdsWithAnalytics) {
      const titleAnalytics = userAnalytics.filter(analytic => analytic.meta.titleId === id);
      const title = titles.find(t => t?.id === id);
      const a = aggregate(titleAnalytics);
      const titleOrgs = orgs.filter(o => title?.orgIds.includes(o.id));

      rows.push({
        uid: user.uid,
        user: displayName(user),
        email: user.email,
        'user org id': user.orgId,
        'org name': user.org ? user.org.name : deletedIdentifier.org,
        titleId: id,
        title: title?.title.international || deletedIdentifier.title,
        'title org id(s)': title?.orgIds?.join(', '),
        'title org(s) name': titleOrgs.map(o => o.name).join(', '),
        'total interactions': a.interactions.global.count,
        'interactions on catalog': a.interactions.catalog.count,
        'interactions on festival': a.interactions.festival.count,
        'first interaction on catalog': getDate({ date: a.interactions.catalog.first, exportType, nullValue }),
        'last interaction on catalog': getDate({ date: a.interactions.catalog.last, exportType, nullValue }),
        'last interaction on festival': getDate({ date: a.interactions.festival.last, exportType, nullValue }),
        'page views': a.pageView,
        'screenings requested': a.screeningRequested,
        'screener requested': a.screenerRequested,
        'asking price requested': a.askingPriceRequested,
        'promo element opened': a.promoElementOpened,
        'added to wishlist': a.addedToWishlist,
        'removed from wishlist': a.removedFromWishlist,
        'filtered Avails Calendar': a.filteredAvailsCalendar,
        'filtered Avails Map': a.filteredAvailsMap,
      });
    }
  }
  return rows;
}

export function orgAnalyticsToExport(organizationAnalytics: Analytics<'organization'>[], orgs: Organization[]) {
  const aggregator: Record<
    string,
    {
      profile: PublicUser | AnonymousCredentials;
      orgId?: string;
      isAnonymous: boolean;
      views: Record<string, Date[]>;
    }
  > = {};

  const rows = [];
  for (const analytic of filterOwnerEvents(organizationAnalytics)) {
    if (!aggregator[analytic.meta.profile.email]) {
      aggregator[analytic.meta.profile.email] = {
        profile: analytic.meta.profile,
        orgId: analytic.meta.orgId,
        isAnonymous: !analytic.meta.orgId,
        views: {},
      };
    }

    if (!aggregator[analytic.meta.profile.email].views[analytic.meta.organizationId]) {
      aggregator[analytic.meta.profile.email].views[analytic.meta.organizationId] = [];
    }
    aggregator[analytic.meta.profile.email].views[analytic.meta.organizationId].push(analytic._meta.createdAt);
  }

  for (const [email, aggregated] of Object.entries(aggregator)) {
    const userOrg = aggregated.orgId ? orgs.find(o => o.id === aggregated.orgId) : undefined;
    const userOrgName = userOrg ? userOrg.name : deletedIdentifier.org;

    for (const [visitedOrgId, hits] of Object.entries(aggregated.views)) {
      const visitedOrg = orgs.find(o => o.id === visitedOrgId);
      for (const date of hits) {
        rows.push({
          uid: aggregated.profile.uid,
          email,
          firstName: aggregated.profile.firstName,
          lastName: aggregated.profile.lastName,
          'user org id': aggregated.profile.orgId,
          'user org name': aggregated.isAnonymous ? '' : userOrgName,
          anonymous: aggregated.isAnonymous,
          'visited org id': visitedOrgId,
          'visited org name': visitedOrg ? visitedOrg.name : deletedIdentifier.org,
          date,
        });
      }
    }
  }
  return rows;
}

export function searchAnalyticsToExport(
  searchAnalytics: Analytics<'titleSearch'>[],
  users: CrmUser[],
  orgs: Organization[],
  titles: Movie[],
  exportType: ExportType
) {
  const nullValue = exportType === 'csv' ? '--' : null;
  const rows = [];
  for (const titleSearch of searchAnalytics) {
    const user = users.find(u => u.uid === titleSearch._meta.createdBy);
    const org = orgs.find(o => o.id === user?.orgId);
    const availsSearch = titleSearch.meta.search?.avails as AvailsFilter;
    const search = titleSearch.meta.search?.search;

    const row = {
      // Common
      uid: titleSearch._meta.createdBy,
      user: user ? displayName(user) : deletedIdentifier.user,
      email: user?.email || nullValue,
      orgId: user?.orgId || nullValue,
      'org name': org ? org.name : deletedIdentifier.org,
      date: titleSearch._meta.createdAt,
      'event name': titleSearch.name,
      app: titleSearch._meta.createdFrom,
      module: titleSearch.meta.module,
      // Avails
      from: availsSearch?.duration?.from || nullValue,
      to: availsSearch?.duration?.to || nullValue,
      territories: toGroupLabel(availsSearch?.territories || [], 'territories', 'World').join(', '),
      medias: toGroupLabel(availsSearch?.medias || [], 'medias', 'All Rights').join(', '),
      exclusivity: availsSearch?.exclusive,
      // Search
      search: '',
      'content type': '',
      genres: '',
      'origin countries': '',
      languages: '',
      version: '',
      'festival selection': '',
      qualifications: '',
      'min release year': null,
      'max release year': null,
      'min budget': null,
      titleId: '',
      title: '',
      // Avails Search
      'title org id(s)': '',
      'title org(s) name': '',
      // PDF
      'exported title count': null,
      'export PDF status': null,
    };

    // Search
    if (!['filteredAvailsCalendar', 'filteredAvailsMap'].includes(titleSearch.name)) {
      row.search = search?.query || nullValue;
      row['content type'] = search?.contentType ? toLabel(search.contentType, 'contentType') : nullValue;
      row.genres = toLabel(search?.genres || [], 'genres');
      row['origin countries'] = toLabel(search?.originCountries || [], 'territories');
      row.languages = toLabel(search?.languages?.languages || [], 'languages');
      row.version = `${search?.languages?.versions.caption ? 'captioned ' : ''}${
        search?.languages?.versions.dubbed ? 'dubbed ' : ''
      }${search?.languages?.versions.subtitle ? 'subtitled ' : ''}${search?.languages?.versions.original ? 'original' : ''}`;
      row['festival selection'] = toLabel(search?.festivals || [], 'festival');
      row['qualifications'] = toLabel(search?.certifications, 'certifications');
      row['min release year'] = search?.releaseYear?.min || nullValue;
      row['max release year'] = search?.releaseYear?.max || nullValue;
      row['min budget'] = search?.minBudget ? (maxBudget - search.minBudget) : nullValue;
    }

    // Avails Search
    if (['filteredAvailsCalendar', 'filteredAvailsMap'].includes(titleSearch.name)) {
      const title = titles.find(t => t?.id === titleSearch.meta.titleId);
      const titleOrgs = orgs.filter(o => title?.orgIds.includes(o.id));
      row.titleId = titleSearch.meta.titleId || nullValue;
      row.title = title?.title.international || deletedIdentifier.title;
      row['title org id(s)'] = title?.orgIds?.join(', ');
      row['title org(s) name'] = titleOrgs.map(o => o.name).join(', ');
    }

    // PDF
    if (titleSearch.name === 'exportedTitles') {
      row['exported title count'] = titleSearch.meta.titleCount || nullValue;
      row['export PDF status'] = titleSearch.meta.status;
    }

    rows.push(row);
  }
  return rows;
}

export function movieAnalyticsToExport(
  movies: CrmMovie[],
  analytics: Analytics<'title' | 'titleSearch'>[],
  analyticsUids: string[],
  users: User[],
  orgs: Organization[],
  exportType: ExportType
) {
  const nullValue = exportType === 'csv' ? '--' : null;
  const rows = [];
  for (const title of movies) {
    const movieAnalytics = analytics.filter(analytic => analytic.meta.titleId === title.id);
    const uidsWithAnalytics = analyticsUids.filter(uid => movieAnalytics.some(analytic => analytic.meta.uid === uid));
    const titleOrgs = orgs.filter(o => title.orgIds.includes(o.id));

    for (const uid of uidsWithAnalytics) {
      const userAnalytics = movieAnalytics.filter(analytic => analytic.meta.uid === uid);
      const user = users.find(u => u?.uid === uid);
      const org = orgs.find(o => o.id === user?.orgId);
      const a = aggregate(userAnalytics);

      rows.push({
        'title id': title.id,
        title: title.title.international,
        'title org id(s)': title?.orgIds?.join(', '),
        'title org(s) name': titleOrgs.map(o => o.name).join(', '),
        uid,
        user: user ? displayName(user) : deletedIdentifier.user,
        'user email': user?.email || nullValue,
        'user org id': user?.orgId || nullValue,
        'org name': org?.name || nullValue,
        'total interactions': a.interactions.global.count,
        'interactions on catalog': a.interactions.catalog.count,
        'interactions on festival': a.interactions.festival.count,
        'first interaction on catalog': getDate({ date: a.interactions.catalog.first, exportType, nullValue }),
        'last interaction on catalog': getDate({ date: a.interactions.catalog.last, exportType, nullValue }),
        'last interaction on festival': getDate({ date: a.interactions.festival.last, exportType, nullValue }),
        'page views': a.pageView,
        'screenings requested': a.screeningRequested,
        'screener requested': a.screenerRequested,
        'asking price requested': a.askingPriceRequested,
        'promo element opened': a.promoElementOpened,
        'added to wishlist': a.addedToWishlist,
        'removed from wishlist': a.removedFromWishlist,
        'filtered Avails Calendar': a.filteredAvailsCalendar,
        'filtered Avails Map': a.filteredAvailsMap,
      });
    }
  }
  return rows;
}
