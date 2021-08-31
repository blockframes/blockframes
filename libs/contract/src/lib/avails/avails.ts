
import { Media, territoriesISOA3, Territory, TerritoryISOA3Value, TerritoryValue, territories } from '@blockframes/utils/static-model';

import { Bucket } from '../bucket/+state';
import { Holdback, Mandate } from '../contract/+state/contract.model'
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


export function isSold(avails: AvailsFilter, terms: Term<Date>[]) {
  return !!getSoldTerms(avails, terms).length;
}

/** Get all the salesTerms that overlap the avails filter */
export function getSoldTerms(avails: AvailsFilter, terms: Term<Date>[]) {
  return terms.filter(term => (avails.exclusive || term.exclusive)
    && someOf(avails.territories, 'optional').in(term.territories)
    && someOf(avails.medias, 'optional').in(term.medias)
    && someOf(avails.duration, 'optional').in(term.duration)
  );
}

export function isInBucket(avails: AvailsFilter, terms: BucketTerm[]) {
  return terms.some(term =>
    term.exclusive === avails.exclusive
    && allOf(avails.territories).in(term.territories)
    && allOf(avails.medias).in(term.medias)
    && allOf(term.duration).in(avails.duration)
  );
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
