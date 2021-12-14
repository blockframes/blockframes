
import { Movie } from '@blockframes/movie/+state';
import { Media, territoriesISOA3, Territory, TerritoryISOA3 } from '@blockframes/utils/static-model';

import { BucketTerm, Term } from '../term/+state';
import { Mandate, Sale } from '../contract/+state';
import { Bucket, BucketContract } from '../bucket/+state';
import { allOf, exclusivityAllOf, exclusivitySomeOf, someOf } from './sets';


interface FullMandate extends Mandate {
  terms: Term[];
}

interface FullSale extends Sale {
  terms: Term[];
}

interface BucketTermWithContractId extends BucketTerm {
  contractId: string;
}

interface BucketContractWithId extends BucketContract {
  id: string;
  terms: BucketTermWithContractId[]
}

function tinyId() {
  return Math.random().toString(16).substr(2);
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

interface AvailsFilter {
  medias: Media[],
  duration: { from: Date, to: Date },
  territories: Territory[],
  exclusive: boolean
}

function getMatchingMandates(mandates: FullMandate[], avails: AvailsFilter): FullMandate[] {
  return mandates.filter(mandate => mandate.terms.some(term => {
    const exclusivityCheck = exclusivityAllOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = allOf(avails.medias).in(term.medias);
    const durationCheck = allOf(avails.duration).in(term.duration);
    const territoryCheck = allOf(avails.territories).in(term.territories);

    return exclusivityCheck && mediaCheck && durationCheck && territoryCheck;
  }));
}

function getMatchingSales<T extends (FullSale | BucketContractWithId)>(sales: T[], avails: AvailsFilter): T[] {
  return sales.filter(sale => sale.terms.some(term => {
    const exclusivityCheck = exclusivitySomeOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = someOf(avails.medias).in(term.medias);
    const durationCheck = someOf(avails.duration).in(term.duration);
    const territoryCheck = someOf(avails.territories).in(term.territories);

    return exclusivityCheck && mediaCheck && durationCheck && territoryCheck;
  }));
}

function availableTitles(
  avails: AvailsFilter,
  titles: Movie[],
  mandates: FullMandate[],
  sales: FullSale[],
  bucketContracts?: BucketContract[],
): Movie[] {
  return titles.filter(title => {
    const titleSales = sales.filter(s => s.titleId === title.id);
    const titleMandates = mandates.filter(m => m.titleId === title.id);
    const bucketSales = bucketContracts?.filter(s => s.titleId === title.id);

    return availableTitle(avails, titleMandates, titleSales, bucketSales);
  });
}


function availableTitle(
  avails: AvailsFilter,
  mandates: FullMandate[],
  sales: FullSale[],
  bucketContracts?: BucketContract[],
): boolean {

  if (!mandates.length) return false;

  assertValidTitle(mandates, sales, bucketContracts);

  // get only the mandates that meets the avails filter criteria,
  // e.g. if we ask for "France" but the title is mandated in "Germany", we don't care
  const availableMandates = getMatchingMandates(mandates, avails);

  // if there is no mandates left, the title is not available
  if (!availableMandates.length) return false;

  // else we should now check the sales

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  const salesToExclude = getMatchingSales(sales, avails);

  // if there is at least one sale that match the avails, the title is not available
  if (salesToExclude.length) return false;

  // else we should check the bucket (if we have one)

  // for now the title is available and we have no bucket to check
  if (!bucketContracts) return true;

  // we retrieve the sales from the bucket,
  // but we also format everything, adding a fake tiny id so that we can easily find back what we need
  // i.e. `term -(contractId)-> sale -(titleId)-> title`
  const bucketSales = bucketContracts.map(s => {
    const id = tinyId();
    const terms: BucketTermWithContractId[] = s.terms.map(t => ({ ...t, contractId: id}));

    return { ...s, id, terms } as BucketContractWithId;
  });

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  const bucketSalesToExclude = getMatchingSales(bucketSales, avails);

  // if there is at least one sale that match the avails, the title is not available
  if (bucketSalesToExclude.length) return false;

  return true;
}

// ----------------------------
//             MAP
// ----------------------------

interface MapAvailsFilter {
  medias: Media[],
  duration: { from: Date, to: Date },
  exclusive: boolean
}

type TerritoryAvailability = 'not-licensed' | 'available' | 'sold' | 'selected';

type MapAvailabilities = Record<TerritoryISOA3, TerritoryAvailability>;


function getMatchingMapMandates(mandates: FullMandate[], avails: MapAvailsFilter): FullMandate[] {
  return mandates.filter(mandate => mandate.terms.some(term => {
    const exclusivityCheck = exclusivityAllOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = allOf(avails.medias).in(term.medias);
    const durationCheck = allOf(avails.duration).in(term.duration);

    return exclusivityCheck && mediaCheck && durationCheck;
  }));
}

function getMatchingMapSales<T extends (FullSale | BucketContractWithId)>(sales: T[], avails: MapAvailsFilter): T[] {
  return sales.filter(sale => sale.terms.some(term => {
    const exclusivityCheck = exclusivitySomeOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = someOf(avails.medias).in(term.medias);
    const durationCheck = someOf(avails.duration).in(term.duration);

    return exclusivityCheck && mediaCheck && durationCheck;
  }));
}


function territoryAvailabilities(
  avails: MapAvailsFilter,
  mandates: FullMandate[],
  sales: FullSale[],
  bucketContracts?: BucketContract[],
  selected?: TerritoryISOA3[]
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
  const availabilities = {} as MapAvailabilities;
  Object.keys(territoriesISOA3).forEach((k: TerritoryISOA3) => availabilities[k] = 'not-licensed');


  // 1) "paint" the `available` layer
  const availableMandates = getMatchingMapMandates(mandates, avails);
  for (const mandate of availableMandates) {
    for (const term of mandate.terms) {
      for (const territory of term.territories as TerritoryISOA3[]) {
        availabilities[territory] = 'available';
      }
    }
  }


  // 2) "paint" the `sold` layer on top
  const salesToExclude = getMatchingMapSales(sales, avails);
  for (const sale of salesToExclude) {
    for (const term of sale.terms) {
      for (const territory of term.territories as TerritoryISOA3[]) {
        availabilities[territory] = 'sold';
      }
    }
  }

  // 2.5) add the bucket sales territories to the `sold` layer
  const bucketSales = bucketContracts?.map(s => {
    const id = tinyId();
    const terms: BucketTermWithContractId[] = s.terms.map(t => ({ ...t, contractId: id}));

    return { ...s, id, terms } as BucketContractWithId;
  });

  const bucketSalesToExclude = getMatchingMapSales(bucketSales, avails);
  for (const bucketSale of bucketSalesToExclude) {
    for (const term of bucketSale.terms) {
      for (const territory of term.territories as TerritoryISOA3[]) {
        availabilities[territory] = 'sold';
      }
    }
  }

  // 3) "paint" the `selected` layer on top
  selected.forEach((t: TerritoryISOA3) => availabilities[t] = 'selected');

  return availabilities;
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

function getMatchingCalendarSales<T extends (FullSale | BucketContractWithId)>(sales: T[], avails: CalendarAvailsFilter): T[] {
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

  const bucketSales = bucketContracts?.map(s => {
    const id = tinyId();
    const terms: BucketTermWithContractId[] = s.terms.map(t => ({ ...t, contractId: id}));

    return { ...s, id, terms } as BucketContractWithId;
  });

  const bucketSalesToExclude = getMatchingCalendarSales(bucketSales, avails);
  const inBucket = bucketSalesToExclude.map(s =>
    s.terms.map((t): DurationMarker =>
      ({ from: t.duration.from, to: t.duration.to })
    )
  ).flat();

  return { available, sold, inBucket };
}
