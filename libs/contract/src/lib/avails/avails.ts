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

export function getMandateTerms(
  { medias, duration, territories }: AvailsFilter,
  terms: Term<Date>[] // Terms of all mandates of the title
): Term<Date>[] | undefined {
  const result: Term<Date>[] = []
  for (const term of terms) {
    // If starts before term: not available
    if (duration.from.getTime() <= term.duration.from.getTime()) {
      continue;
    }
    // If ends after term: not available
    if (duration.to.getTime() >= term.duration.to.getTime()) {
      continue;
    }

    // If terms has some media of avails: available
    if (term.medias.every(media => !medias.includes(media))) {
      continue;
    }

    // If terms has some territories of avails: available
    if (!!territories?.length && term.territories.every(territory => !territories.includes(territory))) {
      continue;
    }

    result.push(term);
  }

  // If more medias are selected than there are in the mandates: not available
  const resultMedias = result.map(term => term.medias).flat();
  if (medias.some(media => !resultMedias.includes(media))) return [];

  // If more territories are selected than there are in the mandates: not available
  if (!!territories?.length) {
    const resultTerritories = result.map(term => term.territories).flat();
    if (territories.some(territory => !resultTerritories.includes(territory))) return [];
  }

  return result;
}

export function isSold(
  { medias, duration, territories, exclusive }: AvailsFilter,
  terms: Term<Date>[], // Terms of all sales of the title
) {
  return !!getSoldTerms({ medias, duration, territories, exclusive }, terms).length;
}

export function getSoldTerms(
  { medias, duration, territories, exclusive }: AvailsFilter,
  terms: Term<Date>[], // Terms of all sales of the title
) {
  const result: Term<Date>[] = [];
  for (const term of terms) {
    const startDuringDuration = duration.from.getTime() >= term.duration.from.getTime() && duration.from.getTime() <= term.duration.to.getTime();
    const endDuringDuration = duration.to.getTime() <= term.duration.to.getTime() && duration.to.getTime() >= term.duration.from.getTime();
    const inDuration = startDuringDuration || endDuringDuration;
    const wrappedDuration = duration.from.getTime() <= term.duration.from.getTime() && duration.to.getTime() >= term.duration.to.getTime();

    if (exclusive) {

      const intersectsMedia = medias.some(medium => term.medias.includes(medium));
      const intersectsTerritories = !territories.length || territories.some(territory => term.territories.includes(territory));

      if (intersectsMedia && intersectsTerritories && inDuration) {
        result.push(term);
      } else continue;
    } else if (term.exclusive) {
      if (inDuration || wrappedDuration) {
        if (!medias.some(medium => term.medias.includes(medium)) || !territories.some(territory => term.territories.includes(territory))) {
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

export function isInBucket(
  { medias, duration, territories, exclusive }: AvailsFilter,
  avails: AvailsFilter[]
) {
  for (const avail of avails) {
    if (exclusive !== avail.exclusive) {
      continue;
    }
    // If any territory is not included in the avail: not same term
    if (!territories.every(territory => avail.territories.includes(territory))) {
      continue;
    }
    // If any medium is not included in the avail: not same term
    if (!medias.every(medium => avail.medias.includes(medium))) {
      continue;
    }
    // If start before or end after avail: not same term
    const startBefore = duration.from.getTime() < avail.duration.from.getTime();
    const endAfter = duration.to.getTime() > avail.duration.to.getTime();
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