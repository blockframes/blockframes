import { Media, territoriesISOA3, Territory, TerritoryISOA3Value, TerritoryValue, territories } from "@blockframes/utils/static-model";
import { Bucket, BucketTerm } from "../bucket/+state";
import { Mandate } from "../contract/+state/contract.model";
import { Term } from "../term/+state/term.model";
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
}

export function toTerritoryMarker(territory: Territory, contractId: string, mandates: Mandate[]): TerritoryMarker {
  return {
    slug: territory,
    isoA3: territoriesISOA3[territory],
    label: territories[territory],
    contract: mandates.find(m => m.id === contractId)
  }
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
    if (!!avails.territories?.length && term.territories.every(territory => !avails.territories.includes(territory))) {
      continue;
    }

    result.push(term);
  }

  // If more medias are selected than there are in the mandates: not available
  const resultMedias = result.map(term => term.medias).flat();
  if (avails.medias.some(media => !resultMedias.includes(media))) return [];

  // If more territories are selected than there are in the mandates: not available
  if (!!avails.territories?.length) {
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
  return !!getSoldTerms({ medias: avails.medias, duration: avails.duration, territories: avails.territories, exclusive: avails.exclusive }, terms).length;
}

/**
 * 
 * @param avails 
 * @param terms Terms of all sales of the title
 * @returns 
 */
export function getSoldTerms(avails: AvailsFilter, terms: Term<Date>[]) {
  const result: Term<Date>[] = [];
  for (const term of terms) {
    const startDuringDuration = avails.duration.from.getTime() >= term.duration.from.getTime() && avails.duration.from.getTime() <= term.duration.to.getTime();
    const endDuringDuration = avails.duration.to.getTime() <= term.duration.to.getTime() && avails.duration.to.getTime() >= term.duration.from.getTime();
    const inDuration = startDuringDuration || endDuringDuration;
    const wrappedDuration = avails.duration.from.getTime() <= term.duration.from.getTime() && avails.duration.to.getTime() >= term.duration.to.getTime();

    if (avails.exclusive) {

      const intersectsMedia = avails.medias.some(medium => term.medias.includes(medium));
      const intersectsTerritories = !avails.territories.length || avails.territories.some(territory => term.territories.includes(territory));

      if (intersectsMedia && intersectsTerritories && inDuration) {
        result.push(term);
      } else continue;
    } else if (term.exclusive) {
      if (inDuration || wrappedDuration) {
        if (!avails.medias.some(medium => term.medias.includes(medium)) || !avails.territories.some(territory => term.territories.includes(territory))) {
          continue;
        } else {
          result.push(term);
        }
      } else {
        continue;
      }
    } else {
      // If buyer wants a non exclusive rights and the sales term that we are currently checking is not exclusive, we skip the iteration
      continue;
    }
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

///////////
// utils //
///////////
export function findSameTermIndex(terms: BucketTerm[], avail: AvailsFilter) {
  return terms.findIndex(t => isSameTerm(t, avail));
}

/**
 * Avail is matching exactly the bucketTerm
 * @param term 
 * @param avail 
 * @returns 
 */
export function isSameTerm(term: BucketTerm, avail: AvailsFilter) {
  if (term.exclusive !== avail.exclusive) return false;
  if (!avail.duration?.from || term.duration.from.getTime() !== avail.duration.from.getTime()) return false;
  if (!avail.duration?.to || term.duration.to.getTime() !== avail.duration.to.getTime()) return false;
  if (term.medias.length !== avail.medias.length || term.medias.some(medium => !avail.medias.includes(medium))) return false;
  return true;
}

/**
 * Avail is included in bucketTerm
 * @param term 
 * @param avail 
 * @returns 
 */
export function isInTerm(term: BucketTerm, avail: AvailsFilter) {
  if (term.exclusive !== avail.exclusive) return false;
  if (!avail.duration?.from || term.duration.from.getTime() >= avail.duration.from.getTime()) return false;
  if (!avail.duration?.to || term.duration.to.getTime() <= avail.duration.to.getTime()) return false;
  if (term.medias.length !== avail.medias.length || term.medias.some(medium => !avail.medias.includes(medium))) return false;
  return true;
}

export function getTerritories(avail: AvailsFilter, bucket: Bucket, mode: 'exact' | 'in'): Territory[] {
  return bucket.contracts
    .map(c => c.terms).flat()
    .filter(t => mode === 'exact' ? isSameTerm(t, avail) : isInTerm(t, avail))
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
    .map(territory => toTerritoryMarker(territory, term.contractId, mandates))
  ).flat();
}