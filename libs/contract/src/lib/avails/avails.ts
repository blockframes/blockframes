import { Media, Territory } from "@blockframes/utils/static-model";
import { Term } from "../term/+state/term.model";

export interface AvailsFilter {
  medias: Media[],
  duration: { from: Date, to: Date },
  territories: Territory[],
  exclusive: boolean
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
    if (term.medias.every(media => !medias.includes(media)) ) {
      continue;
    }

    // If terms has some territories of avails: available
    if (term.territories.every(territory => !territories.includes(territory))) {
      continue;
    }

    result.push(term);
  }

  // If more medias are selected than there are in the mandates: not available
  const resultMedias = result.map(term => term.medias).flat();
  if (medias.some(media => !resultMedias.includes(media))) return [];

  // If more territories are selected than there are in the mandates: not available
  const resultTerritories = result.map(term => term.territories).flat();
  if (territories.some(territory => !resultTerritories.includes(territory))) return [];
  
  return result;
}

export function isSold(
  { medias, duration, territories, exclusive }: AvailsFilter,
  terms: Term<Date>[] // Terms of all sales of the title
) {
  for (const term of terms) {
    const startDuringDuration = duration.from.getTime() >= term.duration.from.getTime() && duration.from.getTime() <= term.duration.to.getTime();
    const endDuringDuration = duration.to.getTime() <= term.duration.to.getTime() && duration.to.getTime() >= term.duration.from.getTime();
    const inDuration = startDuringDuration || endDuringDuration;
    const wrappedDuration = duration.from.getTime() <= term.duration.from.getTime() && duration.to.getTime() >= term.duration.to.getTime();

    if (exclusive) {

      const intersectsMediaAndTerritory = territories.some(territory => term.territories.includes(territory)) &&
        medias.some(medium => term.medias.includes(medium));

      if (intersectsMediaAndTerritory && inDuration) {
        return true
      }
      continue;
    } else if (term.exclusive) {
      if (inDuration || wrappedDuration) {
        if (!medias.some(medium => term.medias.includes(medium)) || !territories.some(territory => term.territories.includes(territory))) {
          continue;
        } else {
          return true;
        }
      } else {
        continue;
      }
    } else {
      // If buyer wants a non exclusive rights and the sales term that we are currently checking is not exclusive, we skip the iteration
      continue;
    }
  }
  return false;
}

export function isInBucket(
  { medias, duration, territories, exclusive }: AvailsFilter,
  terms: AvailsFilter[]  // terms in the bucket for the parentTermId given by "getMandateTerm"
) {
  for (const term of terms) {
    if (exclusive !== term.exclusive) {
      continue;
    }
    // If any territory is not included in the terms: not same term
    if (!territories.every(territory => term.territories.includes(territory))) {
      continue;
    }
    // If any medium is not included in the terms: not same term
    if (!medias.every(medium => term.medias.includes(medium))) {
      continue;
    }
    // If start before or end after term: not same term
    const startBefore = duration.from.getTime() < term.duration.from.getTime();
    const endAfter = duration.to.getTime() > term.duration.to.getTime();
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
export function findSameAvailIndex(avails: AvailsFilter[], term: Term) {
  for (let i = 0; i < avails.length; i++) {
    const avail = avails[i];
    if (avail.exclusive !== term.exclusive) continue;
    if (avail.duration.from.getTime() !== term.duration.from.getTime()) continue;
    if (avail.duration.to.getTime() !== term.duration.to.getTime()) continue;
    if (avail.medias.some(medium => !term.medias.includes(medium))) continue; 
    return i;
  }
  return -1;
}