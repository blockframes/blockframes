import { Media, territoriesISOA3, Territory, TerritoryISOA3Value, TerritoryValue, territories } from "@blockframes/utils/static-model";
import { Bucket } from "../bucket/+state";
import { Holdback, Mandate } from "../contract/+state/contract.model"
import { Duration, Term, BucketTerm } from "../term/+state/term.model";

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

/**
 *
 * @param avails
 * @param terms Terms of all mandates of the title
 * @returns
 */
export function getMandateTerms(avails: AvailsFilter, terms: Term<Date>[]): Term<Date>[] | undefined {
  const result: Term<Date>[] = [];
  for (const term of terms) {
    // If starts before term: not available
    if (avails.duration.from.getTime() <= term.duration.from.getTime()) {
      continue;
    }
    // If ends after term: not available
    if (avails.duration.to.getTime() >= term.duration.to.getTime()) {
      continue;
    }

    // If terms has some media of avails: available
    if (term.medias.every(media => !avails.medias.includes(media))) {
      continue;
    }

    // If terms has some territories of avails: available
    if (avails.territories?.length && term.territories.every(territory => !avails.territories.includes(territory))) {
      continue;
    }

    result.push(term);
  }

  // If more medias are selected than there are in the mandates: not available
  const resultMedias = result.map(term => term.medias).flat();
  if (avails.medias.some(media => !resultMedias.includes(media))) return [];

  // If more territories are selected than there are in the mandates: not available
  if (avails.territories?.length) {
    const resultTerritories = result.map(term => term.territories).flat();
    if (avails.territories.some(territory => !resultTerritories.includes(territory))) return [];
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
  const result: Term<Date>[] = [];
  for (const term of terms) {

    // If both of them are false, its available
    if (!avails.exclusive && !term.exclusive) continue;

    // In case of non-required territories (e.g. map in Avails tab), there is no need to check the territories.
    if (avails.territories.length) {
      // If none of the avails territories are in the term, its available
      if (!term.territories.some(t => avails.territories.includes(t))) continue;
    };

    if (avails.medias.length) {
      // If none of the avails medias are in the term, its available
      if (!term.medias.some(m => avails.medias.includes(m))) continue;
    }

    // If duration is non-required (e.g. calendar on Avails tab), there is no need to check the duration.
    if (avails.duration.from && avails.duration.to) {
      if (avails.duration.to.getTime() < term.duration.from.getTime()) continue
      if (avails.duration.from.getTime() > term.duration.to.getTime()) continue;
      // if time is the same, its sold.
    }

    result.push(term);
  }
  return result;
}

export function isInBucket(avails: AvailsFilter, terms: BucketTerm[]) {
  for (const term of terms) {
    if (avails.exclusive !== term.exclusive) {
      continue;
    }
    // If any territory is not included in the avail: not same term
    if (!avails.territories.every(territory => term.territories.includes(territory))) {
      continue;
    }
    // If any medium is not included in the avail: not same term
    if (!avails.medias.every(medium => term.medias.includes(medium))) {
      continue;
    }
    // If start before or end after avail: not same term
    const startBefore = avails.duration.from.getTime() < term.duration.from.getTime();
    const endAfter = avails.duration.to.getTime() > term.duration.to.getTime();
    if (startBefore || endAfter) {
      continue;
    }
    // If none of the above: term already in bucket
    return true;
  }
  // If all check above are available: term is not in bucket
  return false;
}

// ----------------------------
//          SAME TERM        //
// ----------------------------


function isSameExclusivityTerm(term: BucketTerm, avail: AvailsFilter) {
  if (term.exclusive !== avail.exclusive) return false;
  return true;
}

function isSameMediaTerm(term: BucketTerm, avail: AvailsFilter) {
  if (!avail.medias) return false;
  if (term.medias.length !== avail.medias.length) return false;
  if (term.medias.some(medium => !avail.medias.includes(medium))) return false;
  return true;
}

function isSameTerritoriesTerm(term: BucketTerm, avail: AvailsFilter) {
  if (!avail.territories) return false;
  if (term.territories.length !== avail.territories.length) return false;
  if (term.territories.some(territory => !avail.territories.includes(territory))) return false;
  return true;
}

function isSameDurationTerm(term: BucketTerm, avail: AvailsFilter) {
  if (!avail.duration?.from) return false;
  if (term.duration.from.getTime() !== avail.duration.from.getTime()) return false;
  if (!avail.duration?.to) return false;
  if (term.duration.to.getTime() !== avail.duration.to.getTime()) return false;
  return true;
}

/** Check if a term is exactly the same as asked in the AvailFilter of the world map */
export function isSameMapTerm(term: BucketTerm, avail: AvailsFilter) {
  return isSameExclusivityTerm(term, avail) &&
    isSameDurationTerm(term, avail) &&
    isSameMediaTerm(term, avail);
};

/** Check if a term is exactly the same as asked in the AvailFilter of the calendar */
export function isSameCalendarTerm(term: BucketTerm, avail: AvailsFilter) {
  return isSameExclusivityTerm(term, avail) &&
    isSameTerritoriesTerm(term, avail) &&
    isSameMediaTerm(term, avail);
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
  if (isSameMapTerm(term, avail)) return false;

  if (term.exclusive !== avail.exclusive) return false;

  if (!avail.duration?.from) return false;
  if (term.duration.from.getTime() > avail.duration.from.getTime()) return false;

  if (!avail.duration?.to) return false;
  if (term.duration.to.getTime() < avail.duration.to.getTime()) return false;

  if (!avail.medias) return false;
  if (term.medias.length !== avail.medias.length) return false;
  if (term.medias.some(medium => !avail.medias.includes(medium))) return false;

  return true;
}

export function isInCalendarTerm(term: BucketTerm, avail: AvailsFilter) {

  if (isSameCalendarTerm(term, avail)) return false;

  if (term.exclusive !== avail.exclusive) return false;

  if (!avail.medias) return false;
  if (term.medias.length < avail.medias.length) return false;
  if (avail.medias.some(medium => !term.medias.includes(medium))) return false;

  if (!avail.territories) return false;
  if (term.territories.length < avail.territories.length) return false;
  if (avail.territories.some(territory => !term.territories.includes(territory))) return false;

  return true;
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



export function collidingDurations(durationA: Duration, durationB: Duration) {
  const isBefore = durationA.from < durationB.from && durationA.to < durationB.from;
  const isAfter = durationA.from > durationB.to && durationA.to > durationB.to;
  return !isBefore && !isAfter;
}

export function collidingTerritories(territoriesA: Territory[], territoriesB: Territory[]) {
  return territoriesA.some(territory => territoriesB.includes(territory));
}

export function collidingMedias(mediasA: Media[], mediasB: Media[]) {
  return mediasA.some(media => mediasB.includes(media));
}

export function collidingHoldback(holdback: Holdback, term: Term) {
  const durationCollision = collidingDurations(holdback.duration, term.duration);
  const mediasCollision = collidingMedias(holdback.medias, term.medias);
  const territoryCollision = collidingTerritories(holdback.territories, term.territories);
  return durationCollision && mediasCollision && territoryCollision;
}

export function getCollidingHoldbacks(holdbacks: Holdback[], terms: Term[]) {
  const holdbackCollision = holdbacks.filter(holdback =>
    terms.some(term => collidingHoldback(holdback, term))
  );
  return holdbackCollision;
}
