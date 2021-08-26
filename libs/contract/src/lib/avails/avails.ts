import { Media, territoriesISOA3, Territory, TerritoryISOA3Value, TerritoryValue, territories } from "@blockframes/utils/static-model";
import { Bucket } from "../bucket/+state";
import { Holdback, Mandate } from "../contract/+state/contract.model"
import { Duration, Term, BucketTerm } from "../term/+state/term.model";
import { continuousDisjoint, continuousEqual, continuousSubset, discreteDisjoint, discreteEqual, discreteSubset } from "./sets";

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


// Check if duration A and duration B are colliding
//
// If duration A is strictly before...
//       A.from     A.to
//         |--------|
//                     |------------------|
//                   B.from              B.to
//
// ...OR if duration B is strictly after...
//                       A.from     A.to
//                         |--------|
//   |------------------|
// B.from              B.to
//
// ... then duration are not colliding
export function collidingDurations(durationA: Duration, durationB: Duration) {
  const isBefore = durationA.from < durationB.from && durationA.to < durationB.from;
  const isAfter = durationA.from > durationB.to && durationA.to > durationB.to;
  return !isBefore && !isAfter;
}

// Check if duration A is strictly contained in duration B

//       A.from     A.to
//         |--------|
//    |------------------|
//  B.from              B.to
// export function isInDuration(durationA: Duration, durationB: Duration) {
//   const startBefore = durationA.from <= durationB.from;
//   const endAfter = durationA.to >= durationB.to;
//   return !startBefore && !endAfter;
// }

export function collidingTerritories(territoriesA: Territory[], territoriesB: Territory[]) {
  return territoriesA.some(territory => territoriesB.includes(territory));
}

export function collidingMedias(mediasA: Media[], mediasB: Media[]) {
  return mediasA.some(media => mediasB.includes(media));
}

/**
 *
 * @param avails
 * @param terms Terms of all mandates of the title
 * @returns
 */
export function getMandateTerms(avails: AvailsFilter, terms: Term<Date>[]): Term<Date>[] | undefined {

  const result = terms.filter(term =>
    continuousSubset(term.duration, avails.duration) &&
    discreteSubset(term.medias, avails.medias) &&
    // if there is no territories selected in the avails, we still want to get the term
    (!avails.territories.length || discreteSubset(term.territories, avails.territories))
  );

  // If more medias are selected than there are in the mandates: not available
  const resultMedias = result.map(term => term.medias).flat();
  if (!discreteSubset(resultMedias, avails.medias)) return [];

  // If more territories are selected than there are in the mandates: not available
  if (avails.territories?.length) {
    const resultTerritories = result.map(term => term.territories).flat();
    if (!discreteSubset(resultTerritories, avails.territories)) return [];
  }

  return result;
}

/**
 *
 * @param avails
 * @param terms Terms of all sales of the title
 * @returns
 */
export function isSold(avails: AvailsFilter, terms: Term<Date>[]) {
  return !!getSoldTerms(avails, terms).length;
}

/**
 * Get all the salesTerms that overlap the avails filter
 * @param avails
 * @param terms Terms of all sales of the title
 * @returns
 */
export function getSoldTerms(avails: AvailsFilter, terms: Term<Date>[]) {
  return terms.filter(term =>
    (avails.exclusive || term.exclusive) && // If both of them are false, its available
    // In case of non-required territories (e.g. map in Avails tab), there is no need to check the territories.
    (!avails.territories.length || !discreteDisjoint(term.territories, avails.territories)) &&
    // If none of the avails medias are in the term, its available
    (!avails.medias.length || !discreteDisjoint(term.medias, avails.medias)) &&
    // If duration is non-required (e.g. calendar on Avails tab), there is no need to check the duration.
    (!avails.duration.from || !avails.duration.to || !continuousDisjoint(term.duration, avails.duration))
  );
}

export function isInBucket(avails: AvailsFilter, terms: BucketTerm[]) {
  return terms.some(term =>
    term.exclusive === avails.exclusive &&
    discreteSubset(term.territories, avails.territories) &&
    discreteSubset(term.medias, avails.medias) &&
    continuousSubset(term.duration, avails.duration)
  );
}

// ----------------------------
//          SAME TERM        //
// ----------------------------

/** Check if a term is exactly the same as asked in the AvailFilter of the world map */
export function isSameMapTerm(term: BucketTerm, avail: AvailsFilter) {
  return term.exclusive === avail.exclusive &&
    continuousEqual(term.duration, avail.duration) &&
    discreteEqual(term.medias, avail.medias);
};

/** Check if a term is exactly the same as asked in the AvailFilter of the calendar */
export function isSameCalendarTerm(term: BucketTerm, avail: AvailsFilter) {
  return term.exclusive === avail.exclusive &&
    discreteEqual(term.territories, avail.territories) &&
    discreteEqual(term.medias, avail.medias);
};


// ----------------------------
//            IN TERM        //
// ----------------------------

/**
 * Avail is included in bucketTerm
 * @param term
 * @param avail
 * @returns
 */
export function isInMapTerm(term: BucketTerm, avail: AvailsFilter) {
  return !isSameMapTerm(term, avail) &&
    (avail.duration?.from && avail.duration?.to) &&
    continuousSubset(term.duration, avail.duration) &&
    avail.medias &&
    discreteSubset(term.medias, avail.medias);
}

export function isInCalendarTerm(term: BucketTerm, avail: AvailsFilter) {
  return !isSameCalendarTerm(term, avail) &&
    avail.medias &&
    discreteSubset(term.medias, avail.medias) &&
    avail.territories &&
    discreteSubset(term.territories, avail.territories);
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
  const durationCollision = collidingDurations(holdback.duration, term.duration);
  const mediasCollision = collidingMedias(holdback.medias, term.medias);
  const territoryCollision = collidingTerritories(holdback.territories, term.territories);
  return durationCollision && mediasCollision && territoryCollision;
}

export function getCollidingHoldbacks(holdbacks: Holdback[], terms: BucketTerm[]) {
  const holdbackCollision = holdbacks.filter(holdback =>
    terms.some(term => collidingHoldback(holdback, term))
  );
  return holdbackCollision;
}
