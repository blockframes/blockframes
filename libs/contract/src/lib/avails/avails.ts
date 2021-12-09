
import { Media, territoriesISOA3, Territory, TerritoryISOA3Value, TerritoryValue, territories } from '@blockframes/utils/static-model';

import { Bucket } from '../bucket/+state';
import { Holdback, Mandate, Sale } from '../contract/+state/contract.model'
import { Duration, Term, BucketTerm } from '../term/+state/term.model';
import { allOf, someOf } from './sets';

export interface AvailsFilter {
  medias: Media[],
  duration: { from: Date, to: Date },
  territories?: Territory[],
  exclusive: boolean
}

export interface TerritoryMarker {
  slug: Territory,
  isoA3: TerritoryISOA3Value,
  label: TerritoryValue,
  contract?: Mandate,
  term?: Term<Date>,
}

export interface DurationMarker {
  from: Date,
  to: Date,
  contract?: Mandate,
  term?: Term<Date>,
}


export function getMandateTerms(avails: AvailsFilter, terms: Term<Date>[]): Term<Date>[] | undefined {

  const result = terms.filter(term =>
    allOf(avails.duration).in(term.duration)
    && allOf(avails.medias).in(term.medias)
    && allOf(avails.territories, 'optional').in(term.territories)
  );

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


function mandateExclusivityCheck<T extends BucketTerm>(avails: AvailsFilter, term: T) {

  //                                Avail
  //                     | Exclusive | Non-Exclusive |
  //                -----|-----------|---------------|
  //           Exclusive |     ✅    |       ✅     |
  // Mandate        -----|-----------|---------------|
  //       Non-Exclusive |    ❌     |      ✅      |
  //                -----|-----------|---------------|

  return term.exclusive || !avails.exclusive;
}

function saleExclusivityCheck<T extends BucketTerm>(avails: AvailsFilter, term: T) {

  //                                Avail
  //                     | Exclusive | Non-Exclusive |
  //                -----|-----------|---------------|
  //           Exclusive |     ❌    |       ❌     |
  // Sale           -----|-----------|---------------|
  //       Non-Exclusive |    ❌     |      ✅      |
  //                -----|-----------|---------------|

  return !term.exclusive && !avails.exclusive;
}

export function termsCollision(avails: AvailsFilter, terms: BucketTerm<Date>[]) {
  return !!collidingTerms(avails, terms).length;
}

/** Get all the terms that overlap the avails filter */
export function collidingTerms<T extends BucketTerm>(avails: AvailsFilter, terms: T[]) {
  return terms.filter(term => saleExclusivityCheck(avails, term)
    && someOf(avails.territories, 'optional').in(term.territories)
    && someOf(avails.medias, 'optional').in(term.medias)
    && someOf(avails.duration, 'optional').in(term.duration)
  );
}

export function allOfAvailInTerms(avails: AvailsFilter, terms: BucketTerm[], optional?: 'optional') {
  return terms.some(term => {
    const exclusiveCheck = mandateExclusivityCheck(avails, term);
    const territoriesCheck = allOf(avails.territories, optional).in(term.territories);
    const mediasCheck = allOf(avails.medias, optional).in(term.medias);
    const durationCheck = allOf(avails.duration, optional).in(term.duration);
    return exclusiveCheck && territoriesCheck && mediasCheck && durationCheck;
  });
}

// ----------------------------
//          SAME TERM        //
// ----------------------------

/** Check if a term is exactly the same as asked in the AvailFilter of the world map */
export function isSameMapTerm(term: BucketTerm, avail: AvailsFilter) {
  return term.exclusive === avail.exclusive
    && allOf(term.duration).equal(avail.duration)
    && allOf(term.medias).equal(avail.medias);
};

/** Check if a term is exactly the same as asked in the AvailFilter of the calendar */
export function isSameCalendarTerm(term: BucketTerm, avail: AvailsFilter) {
  return term.exclusive === avail.exclusive
    && allOf(term.territories).equal(avail.territories)
    && allOf(term.medias).equal(avail.medias);
};


// ----------------------------
//            IN TERM        //
// ----------------------------

/** Avail is included in bucketTerm */
export function isInMapTerm(term: BucketTerm, avail: AvailsFilter) {
  return !isSameMapTerm(term, avail)
    && allOf(avail.duration, 'optional').in(term.duration)
    && allOf(avail.medias, 'optional').in(term.medias);
}

export function isInCalendarTerm(term: BucketTerm, avail: AvailsFilter) {
  return !isSameCalendarTerm(term, avail)
    && allOf(avail.medias, 'optional').in(term.medias)
    && allOf(avail.territories, 'optional').in(term.territories);
}


// ----------------------------
//        TERRITORIES        //
// ----------------------------


export function toTerritoryMarker(territory: Territory, mandates: Mandate[], term: Term<Date>): TerritoryMarker {
  return {
    slug: territory,
    isoA3: territoriesISOA3[territory],
    label: territories[territory],
    contract: mandates.find(m => m.id === term.contractId),
    term,
  }
}

export function getSelectedTerritories(movieId: string, avail: AvailsFilter, bucket: Bucket, mode: 'exact' | 'in'): Territory[] {
  return bucket.contracts
    .filter(c => c.titleId === movieId)
    .map(c => c.terms).flat()
    .filter(t => mode === 'exact' ? isSameMapTerm(t, avail) : isInMapTerm(t, avail))
    .map(t => t.territories).flat();
}

export function availableTerritories(
  selected: TerritoryMarker[],
  sold: TerritoryMarker[],
  inSelection: TerritoryMarker[],
  avails: AvailsFilter,
  mandates: Mandate[],
  terms: Term<Date>[],
) {
  const notAvailable = [...selected, ...sold, ...inSelection].map(t => t.slug).flat();
  const mandateTerms = getMandateTerms(avails, terms);
  return mandateTerms.map(term => term.territories
    .filter(t => !!territoriesISOA3[t])
    .filter(t => !notAvailable.includes(t))
    .map(territory => toTerritoryMarker(territory, mandates, term))
  ).flat();
}


export function getTerritoryMarkers(mandates: Mandate[], mandateTerms: Term<Date>[]) {
  const markers: Record<string, TerritoryMarker> = {};
  for (const term of mandateTerms) {
    for (const territory of term.territories) {
      if (territory in territoriesISOA3) {
        markers[territory] = toTerritoryMarker(territory, mandates, term);
      }
    }
  }

  return markers;
}

// ----------------------------
//         DURATIONS         //
// ----------------------------

export function toDurationMarker(mandates: Mandate[], term: Term<Date>): DurationMarker {
  return {
    from: term.duration.from,
    to: term.duration.to,
    contract: mandates.find(m => m.id === term.contractId),
    term,
  }
}

export function getDurations(movieId: string, avail: AvailsFilter, bucket: Bucket, mode: 'exact' | 'in'): Duration[] {
  return bucket.contracts
    .filter(contract => contract.titleId === movieId)
    .map(c => c.terms).flat()
    .filter(t => mode === 'exact' ? isSameCalendarTerm(t, avail) : isInCalendarTerm(t, avail))
    .map(t => t.duration).flat();
}

export function getDurationMarkers(mandates: Mandate[], mandateTerms: Term<Date>[]) {
  return mandateTerms.map(term => toDurationMarker(mandates, term));
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
//           MOVIE           //
// ----------------------------

export function filterByTitleId(titleId: string, mandates: Mandate[], mandateTerms: Term[], sales: Sale[], saleTerms: Term[]) {
  // Gather only mandates & mandate terms related to this title
  const titleMandates = mandates.filter(mandate => mandate.titleId === titleId);
  const titleMandateTerms = mandateTerms.filter(mandateTerm => titleMandates.some(mandate => mandate.id === mandateTerm.contractId));

  // Gather only sales & sale terms related to this title
  const titleSales = sales.filter(sale => sale.titleId === titleId);
  const titleSaleTerms = saleTerms.filter(saleTerm => titleSales.some(sale => sale.id === saleTerm.contractId));

  return { titleMandates, titleMandateTerms, titleSales, titleSaleTerms };
}

/**
 * Check if a movie is available according to the avails requested.
 * The `mandateTerms` & `saleTerms` should already be filtered for the given title.
 * _(you can use the `filterByTitleId` function for that)_
 * @param optional if this parameter is set, avails can be partial, and the function will try to match only existing avails properties
 */
export function isMovieAvailable(titleId: string, avails: AvailsFilter, bucket: Bucket, mandateTerms: BucketTerm[], saleTerms: BucketTerm[], optional?: 'optional') {

  // A Title is available if it succeed every check

  // CHECK (1) if no mandates matches the avails requested by the user, then the title is not available for this request
  const mandatesColliding = allOfAvailInTerms(avails, mandateTerms, optional);
  if (!mandatesColliding) return false;

  // TODO issue#7139 we might want to extract bucket part in a different method
  // CHECK (2) if all the requested avails are already existing in a term in the bucket for this title,
  // then it shouldn't be displayed to avoid the user selecting it twice
  const bucketTerms = bucket?.contracts.find(c => c.titleId === titleId)?.terms ?? [];
  const inBucket = allOfAvailInTerms(avails, bucketTerms, optional);

  if (inBucket) return false;

  // CHECK (3) if the title is already sold on some part of the requested avails, then it's not available for these avails
  const salesColliding = termsCollision(avails, saleTerms);
  if (salesColliding) return false;

  return true;
}


// @todo(#7139) Factorize that if possible
export function filterDashboardAvails(mandateTerms: BucketTerm[], saleTerms: BucketTerm[], avails: AvailsFilter) {

  if (!mandateTerms.length) return false;

  // If one field not provided: available
  if (!avails.territories?.length) return true;
  if (!avails.medias?.length) return true;
  if (!avails.duration?.from || !avails.duration?.to) return true;
  if (typeof avails.exclusive !== 'boolean') return true;

  //////////////
  // MANDATES //
  //////////////
  // If a no mandate include the avails, it's not available
  const hasMandateCovered = mandateTerms.some(mandate => {
    const { territories, medias, duration, exclusive } = mandate;
    // territories: If some of the avails territories are not in the mandates: not available
    if (avails.territories.some(t => !territories.includes(t))) return false;

    // medias: If some of the avails medias are not in the mandates: not available
    if (avails.medias.some(t => !medias.includes(t))) return false;

    // from: If avails ends before mandates: not available
    if (duration.from > avails.duration.to) return false;
    // to: If avails start after mandates: not available
    if (duration.to < avails.duration.from) return false;

    // exclusivity: If non-exclusive while searching exclusive: not available
    if (avails.exclusive && !exclusive) return false;

    return true;
  });
  if (!hasMandateCovered) return false;

  ///////////
  // SALES //
  ///////////
  // If a sale includes the avails, it's not available
  const hasSaleCovered = saleTerms.some(sale => {
    const { territories, medias, duration, exclusive } = sale;

    // territories: If none of the avails territories are in the sale: available
    if (avails.territories.every(t => !territories.includes(t))) return false;

    // medias: If none of the avails medias are in the sale: available
    if (avails.medias.every(t => !medias.includes(t))) return false;

    // If duration starts after avails: available
    if (duration.from > avails.duration.to) return false;

    // If duration ends before avails: available
    if (duration.to < avails.duration.from) return false;

    // exclusive: If non-exclusive && avails non-exclusive: available
    if (!avails.exclusive && !exclusive) return false;

    return true;
  });
  if (hasSaleCovered) return false;

  return true;
}
