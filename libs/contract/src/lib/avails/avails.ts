import { Media, Territory } from "@blockframes/utils/static-model";
import { Term } from "../term/+state/term.model";
import { Timestamp } from './avails.spec';

export function getAvails({ mandateTerms, saleTerms }: { mandateTerms: Partial<Term<Timestamp>[]>, saleTerms: Partial<Term<Timestamp>[]> }) {
  return mandateTerms.filter(positive => {
    for (const negative of saleTerms) {

      // Territory
      const hasTerritory = positive.territories.every(t => negative.territories.includes(t));

      // Media
      const hasMedia = positive.medias.every(m => negative.medias.includes(m));

      // Duration
      const startDuringDuration = positive.duration.from > negative.duration.from || positive.duration.from < negative.duration.to
      const endDuringDuration = positive.duration.to < negative.duration.from || positive.duration.to > negative.duration.to
      const inDuration = startDuringDuration || endDuringDuration;

      if (hasTerritory && hasMedia && inDuration) return false;
    }
    return true;
  });
}

interface AvailsFilter { medias: Media[], duration: { from: Date, to: Date }, territories: Territory[], exclusive: boolean }

export function filterAvail({ medias, duration, territories, exclusive }: AvailsFilter,
  terms: Term<Date>[]): boolean[] {
  const results = []
  for (const term of terms) {
    if (exclusive) {
      if (duration.from.getTime() < term.duration.from.getTime() && duration.to.getTime() > term.duration.to.getTime()) {
        if (medias.every(media => term.medias.includes(media))) {
          if (territories.every(territory => term.territories.includes(territory))) {
            results.push(true)
          }
        }
      }
    } else {
      if (term.exclusive) {
        if (duration.from.getTime() < term.duration.from.getTime() && duration.to.getTime() > term.duration.to.getTime()) {
          if (medias.every(media => term.medias.includes(media))) {
            if (territories.every(territory => term.territories.includes(territory))) {
              results.push(true)
            }
          }
        }
      }
      else {
        results.push(true)
      }
    }
    results.push(false);
  }
  return results
}

/* If a buyer wants to buy rights on a movie, check if AC has the right on this specificaiton.
If a buyer wants to buy a non exclusive right on a movie, we just need to check if there are already exclusive
rights for that very specification that the buyer specified.
if a buyer wants to buy a exclusive right, we need to check for previously sales that are made on the movie,
if already an exclusive right or a non exclusive right exists, you can't sell the right to him, since it is already taken
guess we won't handle any buy back rights for V0
We don’t look at exclusivity on mandates and assume it’s exclusive for AC */