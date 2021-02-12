import { Media, Territory } from "@blockframes/utils/static-model";
import { Term } from "../term/+state/term.model";
import { Timestamp } from './avails.spec';

export function getAvails({mandateTerms, saleTerms}: { mandateTerms: Partial<Term<Timestamp>[]>, saleTerms: Partial<Term<Timestamp>[]> }) {
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

interface AvailFilter { medias: Media[], duration: { from: Date, to: Date }, territories: Territory[], exclusive: boolean }

export function filterAvail({ medias, duration, territories, exclusive }: AvailFilter, terms:
  Term<Date>[]): boolean {
  let licensed = false;
  for (const term of terms) {
    if (duration.from.getTime() < term.duration.from.getTime() && duration.to.getTime() > term.duration.to.getTime()) {
      if (medias.every(media => term.medias.includes(media))) {
        if (territories.every(territory => term.territories.includes(territory))) {
          licensed = true;
        }
      }
    }
  }
  return licensed
}