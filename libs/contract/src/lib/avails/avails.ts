import { Media, territories, territoriesISOA3, Territory, TerritoryISOA3, TerritoryISOA3Value, TerritoryValue } from '@blockframes/utils/static-model';
import { Bucket, BucketContract, Holdback, Mandate, Sale, BucketTerm, Term } from '@blockframes/model';
import { allOf, exclusivityAllOf, exclusivitySomeOf, someOf } from './sets';
import { max, min, isAfter, isBefore } from 'date-fns'

export interface BaseAvailsFilter {
  medias: Media[],
  exclusive: boolean
}

export interface FullMandate extends Mandate<Date> {
  terms: Term[];
}

export interface FullSale extends Sale<Date> {
  terms: Term[];
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

// ----------------------------
//          TITLE LIST
// ----------------------------

export interface AvailsFilter extends BaseAvailsFilter {
  duration: { from: Date, to: Date },
  territories: Territory[],
}

export function getMatchingMandates(mandates: FullMandate[], avails: AvailsFilter): FullMandate[] {
  return mandates.filter(mandate => mandate.terms.some(term => {
    const exclusivityCheck = exclusivityAllOf(avails.exclusive).in(term.exclusive);
    const mediaCheck = allOf(avails.medias).in(term.medias);
    const durationCheck = allOf(avails.duration).in(term.duration);
    const territoryCheck = allOf(avails.territories).in(term.territories);

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

export function getMandateTerms(avails: AvailsFilter, terms: Term<Date>[]): Term<Date>[] | undefined {
  const result = terms.filter(term => {
    return allOf(avails.duration).in(term.duration)
      && allOf(avails.medias).in(term.medias)
      && allOf(avails.territories, 'optional').in(term.territories);
  });
  // If more medias are selected than there are in the mandates: not available
  const resultMedias = result.map(term => term.medias).flat();
  if (!allOf(avails.medias).in(resultMedias)) return [];
  // If more territories are selected than there are in the mandates: not available
  if (avails.territories?.length) {
    const resultTerritories = result.map(term => term.territories).flat();
    if (!allOf(avails.territories).in(resultTerritories)) return [];
  }
  return result;
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
  const availableMandates = getMatchingMandates(mandates, avails);

  // if there is no mandates left, the title is not available
  if (!availableMandates.length) return [];

  // else we should now check the sales

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  const salesToExclude = getMatchingSales(sales, avails);

  // if there is at least one sale that match the avails, the title is not available
  if (salesToExclude.length) return [];

  // else we should check the bucket (if we have one)

  // for now the title is available and we have no bucket to check
  if (!bucketContracts) return availableMandates;

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  const bucketSalesToExclude = getMatchingSales(bucketContracts ?? [], avails);

  // if there is at least one sale that match the avails, the title is not available
  if (bucketSalesToExclude.length) return [];

  return availableMandates;
}

// ----------------------------
//             MAP
// ----------------------------

export interface MapAvailsFilter extends BaseAvailsFilter {
  duration: { from: Date, to: Date },
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
  term: Term<Date>,
}

interface SoldTerritoryMarker extends TerritoryMarkerBase {
  type: 'sold',
  contract: Sale,
  term: Term<Date>,
}

export interface BucketTerritoryMarker extends TerritoryMarkerBase {
  type: 'selected' | 'in-bucket',
  contract: BucketContract,
  term: BucketTerm,
}

export type TerritoryMarker = NotLicensedTerritoryMarker | AvailableTerritoryMarker | SoldTerritoryMarker | BucketTerritoryMarker;

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
  const mediaCheck = allOf(avail.medias).in(termB.medias);
  const durationCheck = allOf(avail.duration).in(termB.duration);
  return exclusivityCheck && mediaCheck && durationCheck;
}

function getMatchingMapMandates(mandates: FullMandate[], avails: MapAvailsFilter): FullMandate[] {
  return mandates
    .map(({ terms, ...rest }) => ({
      terms: terms.filter(term => isMapTermInAvails(term, avails)),
      ...rest
    }))
    .filter(mandate => mandate.terms.length);
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
  existingMandates?: FullMandate[]
}

export function territoryAvailabilities({
  avails,
  mandates,
  sales,
  bucketContracts,
  existingMandates = [],
}: TerritoryAvailabilityOptions): MapAvailabilities {
  // This function compute the availabilities of every territories simply by applying successive layer of "color" on top of each other
  // 0) we start by coloring everything in the `not-licensed` color
  // 1) we then color the available territories on top of the previous layer, overwriting the color of some territories
  // 2) we repeat the process for the sales & bucket territories to color them as `sold`
  // 3) finally we apply the `selected` color
  // 4) when provided with availableMandates, we are rather searching for an overlap between the avails and the availableMandates.

  // Note: The function doesn't perform any check, from its point of view a `sold` territory can become `selected`
  // Note: The checks should be performed by the parent component to prevent a user to select a `sold` territory
  const isOverlapping = !!existingMandates.length

  assertValidTitle(isOverlapping ? existingMandates : mandates, sales, bucketContracts);

  // 0) initialize the world as `not-licensed`
  const availabilities = {} as Record<Territory, TerritoryMarker>;
  Object.keys(territories).forEach((territory: Territory) => availabilities[territory] = {
    type: 'not-licensed',
    slug: territory,
    isoA3: territoriesISOA3[territory],
    label: territories[territory],
  });


  // 1) "paint" the `available` layer
  const availableMandates = isOverlapping
    ? getOverlappingMapMandates(existingMandates, avails)
    : getMatchingMapMandates(mandates, avails);
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
  const available = correctAvailabilities.filter(a => a.type === 'available') as AvailableTerritoryMarker[];
  const sold = correctAvailabilities.filter(a => a.type === 'sold') as SoldTerritoryMarker[];
  const inBucket = correctAvailabilities.filter(a => a.type === 'in-bucket') as BucketTerritoryMarker[];
  const selected = correctAvailabilities.filter(a => a.type === 'selected') as BucketTerritoryMarker[];

  return { notLicensed, available, sold, inBucket, selected };
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
  term?: Term<Date>,
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
export function isCalendarTermInAvails<T extends BucketTerm | Term>(term: T, avails: CalendarAvailsFilter) {
  const exclusivityCheck = exclusivityAllOf(avails.exclusive).in(term.exclusive);
  if (!exclusivityCheck) return false;
  const mediaCheck = allOf(avails.medias).in(term.medias);
  if (!mediaCheck) return false;
  return allOf(avails.territories).in(term.territories);
}

/**
 * Assuming we have a mandate say mandateA with terms mandateATerms defined as in below.
 * mandateATerms = [
 *   { territories:[terA], medias:[mediaA], duration:ConstantX},
 *   { territories:[terB], medias:[mediaA], duration:ConstantX},
 * ]
 *
 * And AvailsResearch researchA
 * researchA = {territories:[terA, terB], medias:[mediaA], duration:ConstantX}
 * We notice that, researchA as a whole isn't avaible in any of the terms of mandateA but when researchA is
 * thought of as being constituted of 2 sub avails as shown below
 *
 * researchA1 = {territories:[terA], medias:[mediaA], duration:ConstantX}
 *               ------------------
 * researchA2 = {territories:[terB], medias:[mediaA], duration:ConstantX}
 *               ------------------
 *
 * both researchA1 and researchA2 are available on mandateA and we can safely conclude that
 *
 * --researchA is available on mandateA--
 *
 * ----------------------------------------------------------------------------------------------------------
 * NB: The division done above is called `territory-wise` division. Given mandateB with terms
 * mandateBTerms = [
 *   { territories:[terA], medias:[mediaA], duration:ConstantX},
 *   { territories:[terA], medias:[mediaB], duration:ConstantX},
 * ]
 *
 * and an availResearch say researchB where
 * researchB = {territories:[terA], medias:[mediaA, mediaB], duration:ConstantX}
 * We notice that, researchB as a whole isn't avaible in any of the terms of mandateB but when divided `media-wise`
 *
 * researchB1 = {territories:[terA], medias:[mediaA], duration:ConstantX}
 *                                   ---------------
 * researchB2 = {territories:[terA], medias:[mediaB], duration:ConstantX}
 *                                   ---------------
 * We can safely assume that,
 * --researchB is available on mandateB.--
 * ----------------------------------------------------------------------------------------------------------
 *
 * We should note that when it's a `territory-wise` division, the media of the availResearch is a subset to
 * each term media of the mandate in question and when it's a `media-wise` division, the territories of the
 * availResearch is a subset to each of the terms' territories of the corresponding mandate.
 * In case this does not hold, then nothing is available.
 */
function getMatchingCalendarMandates(mandates: FullMandate[], avails: CalendarAvailsFilter) {
  const availableMandates = mandates.map(mandate => {
    const territoryWise = avails.medias.every(media => mandate.terms.every(term => term.medias.includes(media)));
    const mediaWise = avails.territories.every(territory => mandate.terms.every(term => term.territories.includes(territory)));
    if (!territoryWise && !mediaWise) return;
    const field = territoryWise ? 'territories' : 'medias';

    /**
     * Dividing avails `field-wise` to search for availability on sub-avails.
     */
    let availableTerms = avails[field].map(eachField => {
      const newAvail = { ...avails, [field]: [eachField] }
      return mandate.terms.find(term => isCalendarTermInAvails(term, newAvail));
    });

    /**
     * if one of the sub-avails resulting from the division of the avails `field-wise`
     * is not available, then nothing is available.
     */
    const unavailableSubAvail = availableTerms.includes(undefined);
    if (unavailableSubAvail) return;

    /**
     * Each availableTerm's duration might differ from the rest so we need
     * to change their durations to be the period that's the intersection of all their
     * individual durations.
     */
    const from = max(availableTerms.map(term => term.duration.from));
    const to = min(availableTerms.map(term => term.duration.to));

    /** This might happen if the duration of one term has no time intersection with the rest of the other terms.
     * assuming `dA` stands for duration of `termA` and `dB` for duration of `termB`, etc...
     *
     *           dA.to |   dC.from    dC.to  dB.to   |  dF.from
     *          <-|    |      |->     AAAA| <-|      |     |->
     *    0------------|-----------------------------|----------------> time
     *       |->       | |->         |AAAA    <-|    |         <-|
     *       dA.from   | dB.from   dE.from     dE.to |        dF.to
     *
     * We notice that, `dA` and `dF` make it such that, there can't be no intersection period between
     * the durations of [dA, dB, dC, dE, dF].
     * But assuming we only have the durations [dB, dC, dE] to take into account, then `A` marks the intersection period.
     */
    if (isAfter(from, to) || isBefore(to, from)) return;
    availableTerms = availableTerms.map(term => ({ ...term, duration: { from, to } }));
    return { ...mandate, terms: availableTerms };
  });
  return availableMandates.filter(mandate => mandate);
}

function getMatchingCalendarSales<T extends (FullSale | BucketContract)>(sales: T[], avails: CalendarAvailsFilter): T[] {
  return sales.filter(sale => {
    return sale.terms.some(term => {
      const exclusivityCheck = exclusivitySomeOf(avails.exclusive).in(term.exclusive);
      const mediaCheck = someOf(avails.medias).in(term.medias);
      const territoryCheck = someOf(avails.territories).in(term.territories);
      return exclusivityCheck && mediaCheck && territoryCheck;
    });
  });
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

  const availableMandates = getMatchingCalendarMandates(mandates, avails);
  console.log({availableMandates})
  const available = availableMandates.map(m => {
    return m.terms.map((t): DurationMarker =>
      ({ from: t.duration.from, to: t.duration.to, contract: m, term: t })
    );
  }).flat();

  const salesToExclude = getMatchingCalendarSales(sales, avails);
  const sold = salesToExclude.map(s =>
    s.terms.map((t): DurationMarker =>
      ({ from: t.duration.from, to: t.duration.to, term: t })
    )
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

