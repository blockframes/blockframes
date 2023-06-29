import { max, min } from 'date-fns';
import { Bucket, BucketContract } from './bucket';
import { FullMandate, FullSale, Holdback, Mandate, Sale } from './contract';
import { mediaGroup, territories, territoriesISOA3 } from './static';
import { Media, Territory, TerritoryISOA3, TerritoryISOA3Value, TerritoryValue } from './static/types';
import { BucketTerm, Term, Duration } from './terms';

export interface BaseAvailsFilter {
  medias: Media[],
  exclusive: boolean
}

interface AvailSearchResult<A extends BaseAvailsFilter> {
  term?: Term;
  mandate?: FullMandate;
  avail?: A;
}

interface AvailResult<A extends BaseAvailsFilter> {
  periodAvailable: Duration | null;
  available: AvailSearchResult<A>[];
  sales: FullSale[];
}

export function filterContractsByTitle(titleId: string, mandates: Mandate[], mandateTerms: Term[], sales: Sale[], saleTerms: Term[], bucket?: Bucket) {

  // Gather only mandates & mandate terms related to this title
  const termsByMandate: Record<string, Term[]> = {};
  for (const term of mandateTerms) {
    if (!termsByMandate[term.contractId]) termsByMandate[term.contractId] = [];
    termsByMandate[term.contractId].push(term);
  }

  const titleMandates = mandates.filter(mandate => mandate.titleId === titleId);
  const fullMandates = titleMandates.map((m): FullMandate => ({
    ...m,
    terms: termsByMandate[m.id],
  }));

  // Gather only sales & sale terms related to this title
  const termsBySale: Record<string, Term[]> = {};
  for (const term of saleTerms) {
    if (!termsBySale[term?.contractId]) termsBySale[term?.contractId] = [];
    termsBySale[term?.contractId]?.push(term);
  }

  const titleSales = sales.filter(sale => sale.titleId === titleId);
  const fullSales = titleSales.map((s): FullSale => ({
    ...s,
    terms: termsBySale[s.id],
  }));

  const bucketContracts = bucket?.contracts.filter(s => s.titleId === titleId);

  return { mandates: fullMandates, sales: fullSales, bucketContracts };
}

function assertValidTitle(mandates: FullMandate[], sales: FullSale[], bucketContracts: BucketContract[] = []) {
  // check that the mandates & sales are about one single title,
  // i.e. they must all have the same `titleId`
  const mandateIds = mandates.map(m => m.titleId);
  const saleIds = sales.map(s => s.titleId);
  const bucketTitleIds = (bucketContracts).map(b => b.titleId);
  const uniqueIds = new Set([...mandateIds, ...saleIds, ...bucketTitleIds]);
  const differentTitleIds = uniqueIds.size > 1;
  if (differentTitleIds) throw new Error('Mandates & Sales must all have the same title id!');
}

interface SearchAvailsConfig<A extends BaseAvailsFilter> {
  avails: A,
  mandates: FullMandate[],
  sales?: FullSale[],
  mandateFilterFn: (term: Term, avail: A) => boolean,
  saleFilterFn?: (term: Term, avail: A) => boolean,
  breakOnMatch: boolean
};

function combineAvailResults<A extends CalendarAvailsFilter | AvailsFilter>(results: AvailResult<A>[]) {
  const availableResults = results
    .map(({ available }) => available)
    .filter(available => available.length)
    .flat()

  //combine all sub-avails with the same matching term.
  const termIds = availableResults.map(({ mandate }) => mandate.terms[0].id);
  const uniqueTermIds = Array.from(new Set(termIds).values());
  const combinedAvailableResults: AvailSearchResult<A>[] = [];

  for (const termId of uniqueTermIds) {
    const correspondingResults = availableResults.filter(({ mandate }) => mandate.terms[0].id === termId);
    const mandate = correspondingResults[0].mandate;
    const subavailTerritories: Territory[] = [];
    const subavailMedias: Media[] = [];
    for (const result of correspondingResults) {
      subavailMedias.push(...result.avail.medias);
      subavailTerritories.push(...result.avail.territories);
    }
    const avail = {
      ...correspondingResults[0].avail,
      territories: subavailTerritories,
      medias: subavailMedias
    };
    combinedAvailableResults.push({ mandate, avail });
  }


  return combinedAvailableResults;
}

function getMatchingAvailabilities<A extends AvailsFilter | CalendarAvailsFilter>(config: SearchAvailsConfig<A>) {
  const {
    avails,
    mandates,
    sales = [],
    mandateFilterFn,
    saleFilterFn,
  } = config;

  const results: AvailResult<A>[] = [];

  const subAvails = avails.territories.map(territory => {
    return avails.medias.map(media => ({
      ...avails,
      territories: [territory],
      medias: [media]
    }));
  }).flat();

  for (const subAvail of subAvails) {
    const result: Partial<AvailResult<A>> = { available: [], sales: [] };

    mandateLoop: for (const contract of mandates) {

      for (const term of contract.terms) {
        const availInTerm = mandateFilterFn(term, subAvail);
        if (!availInTerm) continue;

        result.periodAvailable = term?.duration;
        const availMatch: AvailSearchResult<A> = {
          mandate: { ...contract, terms: [term] },
          avail: subAvail
        };
        result.available.push(availMatch);

        // Depending of the case, we might want to break or not.
        // If we are just interested to check if there is a mandate term (is title available), we can break once we found one
        // If we want to retreive all the mandates, we don't want to
        if (config.breakOnMatch) break mandateLoop;
      }

    }

    if (sales.length && saleFilterFn) {
      saleLoop: for (const sale of sales) {

        for (const term of sale.terms) {
          const someOfTermInAvail = saleFilterFn(term, subAvail);
          if (!someOfTermInAvail) continue;
          result.sales.push({ ...sale, terms: [term] });

          // Depending of the case, we might want to break or not.
          // If we are just interested to check if a term is already sold, we can break once we found one (titles list)
          // If we want to retreive all the sales, we don't want to (calendar avails)
          if (config.breakOnMatch) break saleLoop;
        }

      }
    }
    results.push(result as AvailResult<A>);
  }

  // Get the none empty sold result
  const salesToExclude = results
    .map(({ sales }) => sales)
    .filter(sales => sales.length)
    .flat();

  // If one of the subAvails has no availability, return empty result
  const unavailableSubAvail = results.find(result => !result.available.length);

  // Take the intersection of all the available duration
  const from = max(results.map((result) => result.periodAvailable?.from));
  const to = min(results.map((result) => result.periodAvailable?.to));

  /**
   * Intersection     |   No Intersection
   * |-----***|....   |   |---|.........
   * .....|***----|   |   .......|------|
   */
  const noIntersection = from > to;

  // If no result or if no intersection return only the sold result
  if (unavailableSubAvail || noIntersection) {
    return {
      periodAvailable: null,
      available: [],
      sales: salesToExclude
    }
  }

  const combinedAvailableResults = combineAvailResults(results);

  return {
    periodAvailable: { from, to },
    available: combinedAvailableResults,
    sales: salesToExclude
  }
}

// ----------------------------
//          TITLE LIST
// ----------------------------

export interface AvailsFilter extends BaseAvailsFilter {
  duration: Duration,
  territories: Territory[],
}

function isAvailAllInTerm(term: Term, avails: AvailsFilter) {
  const exclusivityCheck = exclusivityAllOf(avails.exclusive).in(term.exclusive);
  if (!exclusivityCheck) return false;
  const durationCheck = allOf(avails.duration).in(term.duration);
  if (!durationCheck) return false;
  const mediaCheck = allOf(avails.medias).in(term.medias);
  if (!mediaCheck) return false;
  return allOf(avails.territories).in(term.territories);
}

function isListAvailPartiallyInTerm(term: BucketTerm, avails: AvailsFilter) {
  const exclusivityCheck = exclusivitySomeOf(avails.exclusive).in(term.exclusive);
  if (!exclusivityCheck) return false;
  const mediaCheck = someOf(avails.medias).in(term.medias);
  if (!mediaCheck) return false;
  const durationCheck = someOf(avails.duration).in(term.duration);
  if (!durationCheck) return false;
  return someOf(avails.territories).in(term.territories);
}

function getListMatchingAvailabilities(mandates: FullMandate[], sales: FullSale[], avails: AvailsFilter) {
  const options: SearchAvailsConfig<AvailsFilter> = {
    mandates,
    sales,
    avails,
    mandateFilterFn: isAvailAllInTerm,
    saleFilterFn: isListAvailPartiallyInTerm,
    breakOnMatch: true
  };
  return getMatchingAvailabilities(options);
}

export function getMatchingSales<T extends (FullSale | BucketContract)>(sales: T[], avails: AvailsFilter): T[] {
  return sales.filter(sale => sale.terms.some(term => {
    return isListAvailPartiallyInTerm(term, avails);
  }));
}

export function getMandateTerms(avails: AvailsFilter, mandates: FullMandate[]): AvailSearchResult<AvailsFilter>[] | undefined {
  const options: SearchAvailsConfig<AvailsFilter> = {
    mandates,
    avails,
    mandateFilterFn: isAvailAllInTerm,
    breakOnMatch: true,
  };
  const { available } = getMatchingAvailabilities(options);
  return available.map(a => ({
    term: a.mandate.terms[0],
    mandate: a.mandate,
    avail: a.avail
  }));
}

export function availableTitle(
  avails: AvailsFilter,
  mandates: FullMandate[],
  sales: FullSale[],
  bucketContracts?: BucketContract[],
): FullMandate[] {

  if (!mandates.length) return [];

  assertValidTitle(mandates, sales, bucketContracts);

  // get only the mandates that meets the avails filter criteria,
  // e.g. if we ask for "France" but the title is mandated in "Germany", we don't care
  const { available, sales: salesToExclude } = getListMatchingAvailabilities(mandates, sales, avails);

  // if there is no mandates left, the title is not available
  if (!available.length) return [];

  // if there is at least one sale that match the avails, the title is not available
  if (salesToExclude.length) return [];

  // else we should check the bucket (if we have one)

  // for now the title is available and we have no bucket to check
  if (!bucketContracts) return available.map(({ mandate }) => mandate);

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  const bucketSalesToExclude = getMatchingSales(bucketContracts ?? [], avails);

  // if there is at least one sale that match the avails, the title is not available
  if (bucketSalesToExclude.length) return [];

  return available.map(({ mandate }) => mandate);
}

// ----------------------------
//             MAP
// ----------------------------

export interface MapAvailsFilter extends BaseAvailsFilter {
  duration: Duration,
}

interface TerritoryMarkerBase {
  slug: Territory,
  isoA3: TerritoryISOA3Value,
  label: TerritoryValue,
}

interface NotLicensedTerritoryMarker extends TerritoryMarkerBase {
  type: 'not-licensed';
}

export interface AvailableTerritoryMarker extends TerritoryMarkerBase {
  type: 'available',
  contract: Mandate,
  term: Term,
}

interface SoldTerritoryMarker extends TerritoryMarkerBase {
  type: 'sold',
  contract: Sale,
  term: Term,
}

export interface BucketTerritoryMarker extends TerritoryMarkerBase {
  type: 'selected' | 'in-bucket',
  contract: BucketContract,
  term: BucketTerm,
}

type TerritoryMarker = NotLicensedTerritoryMarker | AvailableTerritoryMarker | SoldTerritoryMarker | BucketTerritoryMarker;

interface MapAvailabilities {
  notLicensed: NotLicensedTerritoryMarker[];
  available: AvailableTerritoryMarker[];
  sold: SoldTerritoryMarker[];
  inBucket: BucketTerritoryMarker[];
  selected: BucketTerritoryMarker[];
}

export const emptyAvailabilities: MapAvailabilities = { notLicensed: [], available: [], sold: [], inBucket: [], selected: [] };

function isMapTermInAvails<T extends BucketTerm | Term>(term: T, avails: MapAvailsFilter) {
  const exclusivityCheck = exclusivityAllOf(avails.exclusive).in(term.exclusive);
  if (!exclusivityCheck) return false;
  const mediaCheck = allOf(avails.medias).in(term.medias);
  if (!mediaCheck) return false;
  return allOf(avails.duration).in(term.duration);
}

function isAvailInTerm<T extends BucketTerm | Term>(avail: MapAvailsFilter, termB: T) {
  const exclusivityCheck = exclusivitySomeOf(avail.exclusive).in(termB.exclusive);
  const mediaCheck = someOf(avail.medias).in(termB.medias);
  const durationCheck = someOf(avail.duration).in(termB.duration);
  return exclusivityCheck && mediaCheck && durationCheck;
}

function getMatchingMapMandates(mandates: FullMandate[], avails: MapAvailsFilter): FullMandate[] {
  const subAvails = avails.medias.map(m => ({ ...avails, medias: [m] }));

  const matchingMandates: FullMandate[] = subAvails.map(avail => mandates
    .map(({ terms, ...rest }) => ({
      terms: terms.filter(term => isMapTermInAvails(term, avail)).map(t => ({ ...t, medias: t.medias.filter(m => avails.medias.includes(m)) })),
      ...rest
    }))
    .filter(mandate => mandate.terms.length)
  ).flat();

  // If one of requested medias is not found in any mandate, no results
  const medias = getAllMedias(matchingMandates);
  if (avails.medias.some(m => !medias.includes(m))) return [];

  const territoriesIntersect = getTerritoriesIntersection(matchingMandates);

  return matchingMandates.map(mandate => ({
    ...mandate,
    terms: mandate.terms.map(term => ({
      ...term,
      territories: term.territories.filter(t => territoriesIntersect.includes(t))
    }))
  }));

}

function getAllMedias(mandates: FullMandate[]) {
  let medias: Media[] = [];
  for (const mandate of mandates) {
    for (const term of mandate.terms) {
      medias = Array.from(new Set(medias.concat(term.medias)));
    }
  }
  return medias;
}

/**
 * Return territories intersection for a set of medias
 * @param mandates 
 * @returns 
 */
function getTerritoriesIntersection(mandates: FullMandate[]): Territory[] {
  const territoriesPerMedia: Partial<Record<Media, Territory[]>> = {};

  for (const mandate of mandates) {
    for (const term of mandate.terms) {
      for (const media of term.medias) {
        if (!territoriesPerMedia[media]) territoriesPerMedia[media] = [];
        territoriesPerMedia[media] = Array.from(new Set(territoriesPerMedia[media].concat(term.territories)));
      }
    }
  }

  const territories: Territory[][] = Object.values(territoriesPerMedia);
  return territories.length ? territories.reduce((a, b) => a.filter(c => b.includes(c))) : [];
}

function getMatchingMapSales(sales: FullSale[], avails: MapAvailsFilter) {
  return sales.filter(sale => sale.terms?.some(term => {
    const exclusivityCheck = exclusivitySomeOf(avails.exclusive).in(term.exclusive);

    const mediaCheck = someOf(avails.medias).in(term.medias);
    const durationCheck = someOf(avails.duration).in(term.duration);

    return exclusivityCheck && mediaCheck && durationCheck;
  }));
}

function getOverlappingMapMandates(mandates: FullMandate[], newTerm: MapAvailsFilter): FullMandate[] {
  return mandates.filter(mandate => mandate.terms.some(term => isAvailInTerm(newTerm, term)));
}

function isMapTermInBucket<T extends BucketTerm | Term>(term: T, avails: MapAvailsFilter) {
  return isMapTermInAvails(term, avails);
}

function isMapTermSelected<T extends BucketTerm | Term>(term: T, avails: MapAvailsFilter) {
  const exclusivityCheck = avails.exclusive === term.exclusive;
  const mediaCheck = allOf(avails.medias).equal(term.medias);
  const durationCheck = allOf(avails.duration).equal(term.duration);

  return exclusivityCheck && mediaCheck && durationCheck;
}

interface TerritoryAvailabilityOptions {
  avails: MapAvailsFilter,
  mandates: FullMandate[],
  sales: FullSale[],
  bucketContracts?: BucketContract[],
}

export function territoryAvailabilities({
  avails,
  mandates,
  sales,
  bucketContracts,
}: TerritoryAvailabilityOptions): MapAvailabilities {
  // This function compute the availabilities of every territories simply by applying successive layer of "color" on top of each other
  // 0) we start by coloring everything in the `not-licensed` color
  // 1) we then color the available territories on top of the previous layer, overwriting the color of some territories
  // 2) we repeat the process for the sales & bucket territories to color them as `sold`
  // 3) finally we apply the `selected` color

  // Note: The function doesn't perform any check, from its point of view a `sold` territory can become `selected`
  // Note: The checks should be performed by the parent component to prevent a user to select a `sold` territory

  assertValidTitle(mandates, sales, bucketContracts);

  // 0) initialize the world as `not-licensed`
  const availabilities = {} as Record<Territory, TerritoryMarker>;
  Object.keys(territories).forEach((territory: Territory) => availabilities[territory] = {
    type: 'not-licensed',
    slug: territory,
    isoA3: territoriesISOA3[territory],
    label: territories[territory],
  });

  // 1) "paint" the `available` layer
  const availableMandates = getMatchingMapMandates(mandates, avails);
  for (const mandate of availableMandates) {
    for (const term of mandate.terms) {
      for (const territory of term.territories as Territory[]) {
        // Key is not "territory" to allow multiple terms for a single territory
        availabilities[`${territory}-${term.medias.join(',')}`] = {
          type: 'available',
          slug: territory,
          isoA3: territoriesISOA3[territory],
          label: territories[territory],
          term,
          contract: mandate,
        };
        // Delete previous "not-licensed" for this territory
        delete availabilities[territory];
      }
    }
  }

  // 2) "paint" the `sold` layer on top
  const salesToExclude = getMatchingMapSales(sales, avails);
  for (const sale of salesToExclude) {
    for (const term of sale.terms) {
      for (const territory of term.territories as Territory[]) {
        availabilities[territory] = {
          type: 'sold',
          slug: territory,
          isoA3: territoriesISOA3[territory],
          label: territories[territory],
          term,
          contract: sale,
        };
      }
    }
  }

  for (const bucketSale of bucketContracts ?? []) {
    for (const term of bucketSale.terms) {
      const isInBucket = isMapTermInBucket(term, avails);
      const isSelected = isMapTermSelected(term, avails);
      if (isSelected) {
        for (const territory of term.territories as TerritoryISOA3[]) {
          availabilities[territory] = {
            type: 'selected',
            slug: territory,
            isoA3: territoriesISOA3[territory],
            label: territories[territory],
            term,
            contract: bucketSale,
          };
        }
      } else if (isInBucket) {
        for (const territory of term.territories as TerritoryISOA3[]) {
          availabilities[territory] = {
            type: 'in-bucket',
            slug: territory,
            isoA3: territoriesISOA3[territory],
            label: territories[territory],
            term,
            contract: bucketSale,
          };
        }
      }
    }
  }

  const correctAvailabilities = Object.values(availabilities).filter(a => !!a.isoA3);

  const notLicensed = correctAvailabilities.filter(a => a.type === 'not-licensed') as NotLicensedTerritoryMarker[];
  const sold = correctAvailabilities.filter(a => a.type === 'sold') as SoldTerritoryMarker[];
  const inBucket = correctAvailabilities.filter(a => a.type === 'in-bucket') as BucketTerritoryMarker[];
  const selected = correctAvailabilities.filter(a => a.type === 'selected') as BucketTerritoryMarker[];

  // Since key is not "territory" we need to remove other layers that could have been added on top
  const available = correctAvailabilities
    .filter(a => a.type === 'available')
    .filter(a => !sold.some(s => a.slug === s.slug))
    .filter(a => !selected.some(s => a.slug === s.slug))
    .filter(a => !inBucket.some(s => a.slug === s.slug)) as AvailableTerritoryMarker[];

  return { notLicensed, available, sold, inBucket, selected };
}

interface OverlappingOptions {
  term: Term,
  existingSales: FullSale[],
  existingMandates?: FullMandate[]
}

export function isTermOverlappingExistingContracts({ term, existingSales, existingMandates = [] }: OverlappingOptions): { licensed: boolean, sold: boolean } {

  assertValidTitle(existingMandates, existingSales, []);

  const mandates: Territory[] = [];
  const sales: Territory[] = [];

  // Check if there is not already a mandate overlapping with current term
  const availableMandates = getOverlappingMapMandates(existingMandates, term);
  for (const mandate of availableMandates) {
    for (const term of mandate.terms) {
      for (const territory of term.territories as Territory[]) {
        mandates.push(territory);
      }
    }
  }

  // Check if there is not already a sale overlapping with current term
  const salesToExclude = getMatchingMapSales(existingSales, term);
  for (const sale of salesToExclude) {
    for (const term of sale.terms) {
      for (const territory of term.territories as Territory[]) {
        sales.push(territory);
      }
    }
  }

  const licensed = !!mandates.filter(a => term.territories.includes(a)).length;
  const sold = !!sales.filter(a => term.territories.includes(a)).length;

  return { licensed, sold };
}

type MediaFamily = 'available' | 'all' | 'tv' | 'vod' | 'other';
export interface TerritorySoldMarker {
  slug: Territory,
  isoA3: TerritoryISOA3Value,
  label: TerritoryValue,
  type: MediaFamily
  contracts?: (FullSale | FullMandate)[]
}

export function territoriesSold(contracts: (FullSale | FullMandate)[]) {
  const availabilities = {} as Record<Territory, TerritorySoldMarker>;
  const allTerms = contracts.map(s => s.terms).flat();

  Object.keys(territories).forEach((territory: Territory) => {
    const termsTerritory = allTerms.filter(t => t.territories.includes(territory));
    if (termsTerritory.length) {
      const territoryContracts = Array.from(termsTerritory.map(t => contracts.find(s => s.id === t.contractId)));
      const family = getMediaFamily(termsTerritory);
      availabilities[territory] = {
        type: family,
        slug: territory,
        isoA3: territoriesISOA3[territory],
        label: territories[territory],
        contracts: territoryContracts
      }
    } else {
      availabilities[territory] = {
        type: 'available',
        slug: territory,
        isoA3: territoriesISOA3[territory],
        label: territories[territory],
      }
    }
  });

  const correctAvailabilities = Object.values(availabilities).filter(a => !!a.isoA3);
  const available = correctAvailabilities.filter(a => a.type === 'available');
  const all = correctAvailabilities.filter(a => a.type === 'all');
  const tv = correctAvailabilities.filter(a => a.type === 'tv');
  const vod = correctAvailabilities.filter(a => a.type === 'vod');
  const other = correctAvailabilities.filter(a => a.type === 'other');
  return { available, all, tv, vod, other };
}

function getMediaFamily(terms: Term[]): MediaFamily {
  const medias = Array.from(new Set(terms.map(t => t.medias).flat()));
  const groups = Array.from(new Set(medias.map(m => mediaGroup.find(g => g.items.includes(m)).label)));

  if (groups.length === 1 && groups[0] === 'TV') return 'tv';
  if (groups.length === 1 && groups[0] === 'VOD') return 'vod';
  if (groups.length >= 3) return 'all';
  return 'other';
}

// ----------------------------
//           CALENDAR
// ----------------------------

export interface CalendarAvailsFilter extends BaseAvailsFilter {
  territories: Territory[],
}

export interface DurationMarker {
  from: Date,
  to: Date,
  contract?: Mandate,
  term?: Term,
  avail?: CalendarAvailsFilter,
}

interface CalendarAvailabilities {
  available: DurationMarker[];
  sold: DurationMarker[];
  inBucket: DurationMarker[];
  selected: DurationMarker;
}

/**
 * as soon as we have a false value, we return.
 * This is a small optimization as this method is called in several loops.
*/
function isCalendarTermInAvails<T extends BucketTerm | Term>(term: T, avails: CalendarAvailsFilter) {
  const exclusivityCheck = exclusivityAllOf(avails.exclusive).in(term.exclusive);
  if (!exclusivityCheck) return false;
  const mediaCheck = allOf(avails.medias).in(term.medias);
  if (!mediaCheck) return false;
  return allOf(avails.territories).in(term.territories);
}

function getMatchingCalendarAvailabilities(avails: CalendarAvailsFilter, mandates: FullMandate[], sales: FullSale[]) {
  const options: SearchAvailsConfig<CalendarAvailsFilter> = {
    avails,
    mandates,
    sales,
    mandateFilterFn: isCalendarTermInAvails,
    saleFilterFn: isCalendarAvailPartiallyInTerm,
    breakOnMatch: false
  };
  return getMatchingAvailabilities(options);
}

export function isCalendarAvailPartiallyInTerm(term: Term, avail: CalendarAvailsFilter) {
  const exclusivityCheck = exclusivitySomeOf(avail.exclusive).in(term.exclusive);
  if (!exclusivityCheck) return false;
  const mediaCheck = someOf(avail.medias).in(term.medias);
  if (!mediaCheck) return false;
  return someOf(avail.territories).in(term.territories);
}

function isCalendarTermInBucket<T extends BucketTerm | Term>(term: T, avails: CalendarAvailsFilter) {
  return isCalendarTermInAvails(term, avails);
}

function isCalendarTermSelected<T extends BucketTerm | Term>(term: T, avails: CalendarAvailsFilter) {
  const exclusivityCheck = avails.exclusive === term.exclusive;
  const mediaCheck = allOf(avails.medias).equal(term.medias);
  const territoryCheck = allOf(avails.territories).equal(term.territories);

  return exclusivityCheck && mediaCheck && territoryCheck;
}

export function durationAvailabilities(
  avails: CalendarAvailsFilter,
  mandates: FullMandate[],
  sales: FullSale[],
  bucketContracts?: BucketContract[],
): CalendarAvailabilities {

  assertValidTitle(mandates, sales, bucketContracts);

  const {
    sales: salesToExclude,
    periodAvailable,
    ...rest
  } = getMatchingCalendarAvailabilities(avails, mandates, sales);

  const available = rest.available.map(availability => {
    const { mandate, avail } = availability;
    return mandate.terms.map((t): DurationMarker => ({
      from: periodAvailable.from,
      to: periodAvailable.to,
      contract: mandate,
      term: t,
      avail
    }));
  }).flat();

  const sold = salesToExclude.map(s =>
    s.terms.map((t): DurationMarker => ({
      from: t.duration.from,
      to: t.duration.to,
      term: t
    }))
  ).flat();


  const inBucket: DurationMarker[] = [];
  let selected: DurationMarker = undefined;

  for (const bucketSale of bucketContracts ?? []) {
    for (const term of bucketSale.terms) {
      const isInBucket = isCalendarTermInBucket(term, avails);
      const isSelected = isCalendarTermSelected(term, avails);
      if (isSelected) {
        selected = { from: term.duration.from, to: term.duration.to };
      } else if (isInBucket) {
        inBucket.push({ from: term.duration.from, to: term.duration.to });
      }
    }
  }

  return { available, sold, inBucket, selected };
}


// ----------------------------
//          COMPARISON
// ----------------------------

export function isSameMapBucketTerm(avails: MapAvailsFilter, term: BucketTerm) {
  const exclusivityCheck = avails.exclusive === term.exclusive;
  const durationCheck = allOf(avails.duration).equal(term.duration);
  const mediasCheck = allOf(avails.medias).equal(term.medias);

  return exclusivityCheck && durationCheck && mediasCheck;
}

export function isSameCalendarBucketTerm(avails: CalendarAvailsFilter, term: BucketTerm) {
  const exclusivityCheck = avails.exclusive === term.exclusive;
  const territoriesCheck = allOf(avails.territories).equal(term.territories);
  const mediasCheck = allOf(avails.medias).equal(term.medias);

  return exclusivityCheck && territoriesCheck && mediasCheck;
}

function isSameBucketTerm(termA: BucketTerm, termB: BucketTerm) {
  const exclusivityCheck = termA.exclusive === termB.exclusive;
  const durationCheck = allOf(termA.duration).equal(termB.duration);
  const territoriesCheck = allOf(termA.territories).equal(termB.territories);
  const mediasCheck = allOf(termA.medias).equal(termB.medias);
  // we ignore the languages

  return exclusivityCheck && durationCheck && territoriesCheck && mediasCheck;
}

export function isSameBucketContract(contractA: BucketContract, contractB: BucketContract) {
  const titleIdCheck = contractA.titleId === contractB.titleId;
  const orgIdCheck = contractA.orgId === contractB.orgId;
  const parentTermIdCheck = contractA.parentTermId === contractB.parentTermId;
  const priceCheck = contractA.price === contractB.price;
  const specificityCheck = contractA.specificity === contractB.specificity;
  const termsCheck = contractA.terms.every((term, index) => isSameBucketTerm(term, contractB.terms[index]));
  // we ignore holdbacks

  return titleIdCheck && orgIdCheck && parentTermIdCheck && priceCheck && specificityCheck && termsCheck;
}

// ----------------------------
//         HOLDBACKS         //
// ----------------------------


export function collidingHoldback(holdback: Holdback, term: BucketTerm) {
  return someOf(term.duration).in(holdback.duration)
    && someOf(term.medias).in(holdback.medias)
    && someOf(term.territories).in(holdback.territories);
}

export function getCollidingHoldbacks(holdbacks: Holdback[], terms: BucketTerm[]) {
  const holdbackCollision = holdbacks.filter(holdback =>
    terms.some(term => collidingHoldback(holdback, term))
  );
  return holdbackCollision;
}


// ----------------------------
//         EASY COMPARE      //
// ----------------------------


// Helpers functions used to check collision, inclusion, etc...
// This is used for example in avail.ts
// These functions can handle two type of data:
// - discrete = `string[]`
// - continuous = `Range`


interface Range { from: number | Date, to: number | Date };

function discreteAllOf(a: string[], optional?: 'optional') {
  return {
    in: (b: string[]) => optional && !a.length ? true : a.every(elt => b.includes(elt)),

    // it's equal if every A is included in B AND if every B is also included in A
    // but we also check the length to avoid the case where A or B has duplicated elements
    equal: (b: string[]) => optional && !a.length ? true : a.length === b.length && a.every(elt => b.includes(elt)) && b.every(elt => a.includes(elt)),
  };
}

function continuousAllOf(a?: Range, optional?: 'optional') {
  return {
    // for continuous data, A is "in" B if the range are like that
    //   A.from   A.to
    //     |------|
    //   |----------|
    // B.from      B.to
    //
    // we also pre-suppose that Range are not malformed (i.e. from must be before to)
    in: (b?: Range) => {
      if (optional && (!a?.from || !a?.to)) return true
      else return a?.from >= b?.from && a?.to <= b?.to
    },

    // To check if it's equal we simply check if `a.to === b.to && a.from === b.from`
    // BUT since we cannot compare Date with `===` we use "not lesser than && not greater than"
    equal: (b?: Range) => {
      if (optional && (!a?.from || !a?.to)) return true
      else return !(a?.from < b?.from) && !(a?.from > b?.from) && !(a?.to < b?.to) && !(a?.to > b?.to)
    },
  }
}

/**
 * Check if all of the elements of A are in or equal to the elements of B.
 *
 * After calling `allOf(a)` you **MUST** call `.in(b)` or `.equal(b)` for the check to be performed.
 * @note `optional` parameter will make the check return `true` if `a` is empty *(or from/to undefined)*.
 * @example
 * allOf(a).in(b);
 * allOf(a).equal(b);
 * allOf([], 'optional').in(b); // true
 */
export function allOf(a: string[], optional?: 'optional'): ReturnType<typeof discreteAllOf>;
export function allOf(a: Range, optional?: 'optional'): ReturnType<typeof continuousAllOf>;
export function allOf(a: string[] | Range, optional?: 'optional') {
  return Array.isArray(a) ? discreteAllOf(a, optional) : continuousAllOf(a, optional);
}

function discreteNoneOf(a: string[], optional?: 'optional') {
  return {
    in: (b: string[]) => optional && !a.length ? true : a.every(elt => !b.includes(elt)),
  };
}


//      A.to
//  ...--|
//          |---...
//        B.from
//
// ~~~~~~~~~~ OR ~~~~~~~~
//
//         A.from
//           |---...
//   ...---|
//       B.to
function continuousNoneOf(a: Range, optional?: 'optional') {
  return {
    in: (b: Range) => optional && (!a?.from || !a?.to) ? true : a?.to < b?.from || b?.to < a?.from,
  };
}

/**
 * Check if none of the elements of A are in the elements of B, i.e. A and B are totally different
 *
 * After calling `noneOf(a)` you **MUST** call `.in(b)` for the check to be performed.
 * @note `optional` parameter will make the check return `true` if `a` is empty *(or from/to undefined)*.
 * @example
 * noneOf(a).in(b);
 * noneOf([], 'optional').in(b); // true
 */
export function noneOf(a: string[], optional?: 'optional'): ReturnType<typeof discreteNoneOf>;
export function noneOf(a: Range, optional?: 'optional'): ReturnType<typeof continuousNoneOf>;
export function noneOf(a: string[] | Range, optional?: 'optional') {
  return Array.isArray(a) ? discreteNoneOf(a, optional) : continuousNoneOf(a, optional);
}

function discreteSomeOf(a: string[], optional?: 'optional') {
  return {
    in: (b: string[]) => optional && !a.length ? true : a.some(elt => b.includes(elt)),
  };
}

//      A.from
//       |---...
//  |------------|
// B.from      B.to
//
// ~~~~~~~~~~~~~~ OR ~~~~~~~~~~~~~
//
//        A.to
//   ...---|
//   |----------|
// B.from      B.to
//
// ~~~~~~~~~~~~~~ OR ~~~~~~~~~~~~~
//
//  A.from           A.to
//   |----------------|
//     |----------|
//   B.from     B.to
export function continuousSomeOf(a?: Range, optional?: 'optional') {
  return {
    in: (b?: Range) => {
      if (optional && (!a?.from || !a?.to)) return true;
      return (a?.from >= b?.from && a?.from <= b?.to) || (a?.to >= b?.from && a?.to <= b?.to) || continuousAllOf(b, optional).in(a)
    },
  };
}

/**
 * Check if some of the elements of A are in the elements of B, i.e. A and B overlap somehow (A ⊆ B or A ⊇ B or A = B)
 *
 * After calling `someOf(a)` you **MUST** call `.in(b)` for the check to be performed.
 * @note `optional` parameter will make the check return `true` if `a` is empty *(or from/to undefined)*.
 * @example
 * someOf(a).in(b);
 * someOf([], 'optional').in(b); // true
 */
export function someOf(a?: string[], optional?: 'optional'): ReturnType<typeof discreteSomeOf>;
export function someOf(a?: Range, optional?: 'optional'): ReturnType<typeof continuousSomeOf>;
export function someOf(a?: string[] | Range, optional?: 'optional') {
  return Array.isArray(a) ? discreteSomeOf(a, optional) : continuousSomeOf(a, optional);
}


// ----------------------------
// SPECIAL EXCLUSIVITY CHECK

/**
 * Check exclusivity
 *
 * |⬇ Mandate \ Avail ➡|Exclusive|Non-Exclusive|
 * |-|-|-|
 * |Exclusive|✅|✅|
 * |Non-Exclusive|❌|✅|
 */
function exclusivityAllOf(availsExclusivity: boolean) {

  //                                Avail form
  //                     | Exclusive | Non-Exclusive |
  //                -----|-----------|---------------|
  //           Exclusive |     ✅    |       ✅     |
  // Mandate        -----|-----------|---------------|
  //       Non-Exclusive |    ❌     |      ✅      |
  //                -----|-----------|---------------|

  return {
    in: (termExclusivity: boolean) => termExclusivity || !availsExclusivity,
  };
}

/**
 * Check exclusivity
 *
 * |⬇ Sale \ Avail ➡|Exclusive|Non-Exclusive|
 * |-|-|-|
 * |Exclusive|✅|✅|
 * |Non-Exclusive|✅|❌|
 */
function exclusivitySomeOf(availsExclusivity: boolean) {

  //                                Avail form
  //                     | Exclusive | Non-Exclusive |
  //                -----|-----------|---------------|
  //           Exclusive |     ✅    |       ✅     |
  // Sale           -----|-----------|---------------|
  //       Non-Exclusive |    ✅     |      ❌      |
  //                -----|-----------|---------------|

  return {
    in: (termExclusivity: boolean) => termExclusivity || availsExclusivity,
  };
}
