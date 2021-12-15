
import { Media, territories, territoriesISOA3, Territory, TerritoryISOA3, TerritoryISOA3Value, TerritoryValue } from '@blockframes/utils/static-model';

import { Term } from '../term/+state';
import { Mandate, Sale } from '../contract/+state';
import { Bucket, BucketContract } from '../bucket/+state';
import { allOf, exclusivityAllOf, exclusivitySomeOf, someOf } from './sets';


export interface FullMandate extends Mandate {
  terms: Term[];
}

export interface FullSale extends Sale {
  terms: Term[];
}

export function filterByTitle(titleId: string, mandates: Mandate[], mandateTerms: Term[], sales: Sale[], saleTerms: Term[], bucket?: Bucket) {


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
    if (!termsBySale[term.contractId]) termsBySale[term.contractId] = [];
    termsBySale[term.contractId].push(term);
  }

  const titleSales = sales.filter(sale => sale.titleId === titleId);
  const fullSales = titleSales.map((s): FullSale => ({
    ...s,
    terms: termsBySale[s.id],
  }));

  const bucketContracts = bucket?.contracts.filter(s => s.titleId === titleId);

  return { mandates: fullMandates, sales: fullSales, bucketContracts };
}


function assertValidTitle(mandates: FullMandate[], sales: FullSale[], bucketContracts?: BucketContract[]) {
  // check that the mandates & sales are about one single title,
  // i.e. they must all have the same `titleId`
  const titleId = mandates[0].titleId;
  const invalidMandate = mandates.some(m => m.titleId !== titleId);
  const invalidSale = sales.some(s => s.titleId !== titleId);
  const invalidBucketSale = bucketContracts?.some(s => s.titleId !== titleId);

  if (invalidMandate || invalidSale || invalidBucketSale) throw new Error('Mandates & Sales must all have the same title id!');
}

// ----------------------------
//          TITLE LIST
// ----------------------------

export interface AvailsFilter {
  medias: Media[],
  duration: { from: Date, to: Date },
  territories: Territory[],
  exclusive: boolean
}

function getMatchingMandates(mandates: FullMandate[], avails: AvailsFilter, debug = false): FullMandate[] {
  return mandates.filter(mandate => mandate.terms.some(term => {
    const exclusivityCheck = exclusivityAllOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = allOf(avails.medias).in(term.medias);
    const durationCheck = allOf(avails.duration).in(term.duration);
    const territoryCheck = allOf(avails.territories).in(term.territories);

    if (debug) console.log({ exclusivityCheck, mediaCheck, durationCheck, territoryCheck });

    return exclusivityCheck && mediaCheck && durationCheck && territoryCheck;
  }));
}

function getMatchingSales<T extends (FullSale | BucketContract)>(sales: T[], avails: AvailsFilter): T[] {
  return sales.filter(sale => sale.terms.some(term => {
    const exclusivityCheck = exclusivitySomeOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = someOf(avails.medias).in(term.medias);
    const durationCheck = someOf(avails.duration).in(term.duration);
    const territoryCheck = someOf(avails.territories).in(term.territories);

    return exclusivityCheck && mediaCheck && durationCheck && territoryCheck;
  }));
}

export function availableTitle(
  avails: AvailsFilter,
  mandates: FullMandate[],
  sales: FullSale[],
  bucketContracts?: BucketContract[],
  debug = false,
): boolean {

  if (!mandates.length) {
    if (debug) console.log('no mandate found for this movie, this movie will never be available.');
    return false;
  }

  assertValidTitle(mandates, sales, bucketContracts);

  // get only the mandates that meets the avails filter criteria,
  // e.g. if we ask for "France" but the title is mandated in "Germany", we don't care
  const availableMandates = getMatchingMandates(mandates, avails, debug);

  // if there is no mandates left, the title is not available
  if (!availableMandates.length) {
    if (debug) console.log('no mandate matches the avails filter, this movie could be available with other criteria.');
    return false;
  }

  // else we should now check the sales

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  const salesToExclude = getMatchingSales(sales, avails);

  // if there is at least one sale that match the avails, the title is not available
  if (salesToExclude.length) {
    if (debug) console.log('this movie was available but it has been sold for some of or all of the requested criteria.');
    return false;
  }

  // else we should check the bucket (if we have one)

  // for now the title is available and we have no bucket to check
  if (!bucketContracts) return true;

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  const bucketSalesToExclude = getMatchingSales(bucketContracts ?? [], avails);

  // if there is at least one sale that match the avails, the title is not available
  if (bucketSalesToExclude.length) {
    if (debug) console.log('this movie is available, but you already selected it, for this criteria, in you shopping cart');
    return false;
  }

  return true;
}

// ----------------------------
//             MAP
// ----------------------------

export interface MapAvailsFilter {
  medias: Media[],
  duration: { from: Date, to: Date },
  exclusive: boolean
}

type TerritoryAvailability = 'not-licensed' | 'available' | 'sold';

interface TerritoryMarker {
  type: TerritoryAvailability,
  slug: Territory,
  isoA3: TerritoryISOA3Value,
  label: TerritoryValue,
  contract?: Mandate,
  term?: Term<Date>,
}

interface MapAvailabilities {
  notLicensed: TerritoryMarker[];
  available: TerritoryMarker[];
  sold: TerritoryMarker[];
}

function getMatchingMapMandates(mandates: FullMandate[], avails: MapAvailsFilter): FullMandate[] {
  return mandates.filter(mandate => mandate.terms.some(term => {
    const exclusivityCheck = exclusivityAllOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = allOf(avails.medias).in(term.medias);
    const durationCheck = allOf(avails.duration).in(term.duration);

    return exclusivityCheck && mediaCheck && durationCheck;
  }));
}

function getMatchingMapSales<T extends (FullSale | BucketContract)>(sales: T[], avails: MapAvailsFilter): T[] {
  return sales.filter(sale => sale.terms.some(term => {
    const exclusivityCheck = exclusivitySomeOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = someOf(avails.medias).in(term.medias);
    const durationCheck = someOf(avails.duration).in(term.duration);

    return exclusivityCheck && mediaCheck && durationCheck;
  }));
}


export function territoryAvailabilities(
  avails: MapAvailsFilter,
  mandates: FullMandate[],
  sales: FullSale[],
  bucketContracts?: BucketContract[],
): MapAvailabilities {

  // This function compute the availabilities of every territories simply by applying successive layer of "color" on top of each other
  // 0) we start by coloring everything in the `not-licensed` color
  // 1) we then color the available territories on top of the previous layer, overwriting the color of some territories
  // 2) we repeat the process for the sales & bucket territories to color them as `sold`
  // 3) finally we apply the `selected` color

  // Note: The function doesn't perform any check, form its point of view a `sold` territory can become `selected`
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
        availabilities[territory] = {
          type: 'available',
          slug: territory,
          isoA3: territoriesISOA3[territory],
          label: territories[territory],
          term,
          contract: mandate,
        };
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
        };
      }
    }
  }

  const bucketSalesToExclude = getMatchingMapSales(bucketContracts ?? [], avails);
  for (const bucketSale of bucketSalesToExclude) {
    for (const term of bucketSale.terms) {
      for (const territory of term.territories as TerritoryISOA3[]) {
        availabilities[territory] = {
          type: 'sold',
          slug: territory,
          isoA3: territoriesISOA3[territory],
          label: territories[territory],
        };
      }
    }
  }

  const notLicensed = Object.values(availabilities).filter(a => a.type === 'not-licensed');
  const available = Object.values(availabilities).filter(a => a.type === 'available');
  const sold = Object.values(availabilities).filter(a => a.type === 'sold');

  return { notLicensed, available, sold };
}

// ----------------------------
//           CALENDAR
// ----------------------------

interface CalendarAvailsFilter {
  medias: Media[],
  territories: Territory[],
  exclusive: boolean
}

interface DurationMarker {
  from: Date,
  to: Date,
  contract?: Mandate,
  term?: Term<Date>,
}

interface CalendarAvailabilities {
  available: DurationMarker[];
  sold: DurationMarker[];
  inBucket: DurationMarker[];
}

function getMatchingCalendarMandates(mandates: FullMandate[], avails: CalendarAvailsFilter): FullMandate[] {
  return mandates.filter(mandate => mandate.terms.some(term => {
    const exclusivityCheck = exclusivityAllOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = allOf(avails.medias).in(term.medias);
    const territoryCheck = allOf(avails.territories).in(term.territories);

    return exclusivityCheck && mediaCheck && territoryCheck;
  }));
}

function getMatchingCalendarSales<T extends (FullSale | BucketContract)>(sales: T[], avails: CalendarAvailsFilter): T[] {
  return sales.filter(sale => sale.terms.some(term => {
    const exclusivityCheck = exclusivitySomeOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = someOf(avails.medias).in(term.medias);
    const territoryCheck = someOf(avails.territories).in(term.territories);

    return exclusivityCheck && mediaCheck && territoryCheck;
  }));
}

function durationAvailabilities(
  avails: CalendarAvailsFilter,
  mandates: FullMandate[],
  sales: FullSale[],
  bucketContracts?: BucketContract[],
): CalendarAvailabilities {

  assertValidTitle(mandates, sales, bucketContracts);

  const availableMandates = getMatchingCalendarMandates(mandates, avails);
  const available = availableMandates.map(m =>
    m.terms.map((t): DurationMarker =>
      ({ from: t.duration.from, to: t.duration.to, contract: m, term: t })
    )
  ).flat();

  const salesToExclude = getMatchingCalendarSales(sales, avails);
  const sold = salesToExclude.map(s =>
    s.terms.map((t): DurationMarker =>
      ({ from: t.duration.from, to: t.duration.to, term: t })
    )
  ).flat();

  const bucketSalesToExclude = getMatchingCalendarSales(bucketContracts ?? [], avails);
  const inBucket = bucketSalesToExclude.map(s =>
    s.terms.map((t): DurationMarker =>
      ({ from: t.duration.from, to: t.duration.to })
    )
  ).flat();

  return { available, sold, inBucket };
}
