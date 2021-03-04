import { Media, Territory } from "@blockframes/utils/static-model";
import { Term } from "../term/+state/term.model";

export interface AvailsFilter {
  medias: Media[],
  duration: { from: Date, to: Date },
  territories: Territory[],
  exclusive: boolean
}

export function isLicensed({ medias, duration, territories }: AvailsFilter,
  terms: Term<Date>[]): boolean {
  for (const term of terms) {
    if (duration.from.getTime() >= term.duration.from.getTime() && duration.to.getTime() <= term.duration.to.getTime()) {
      if (medias.every(media => term.medias.includes(media))) {
        if (territories.every(territory => term.territories.includes(territory))) {
          return true
        }
      }
    }
  }
  return false
}

export function filterSales({ medias, duration, territories, exclusive }: AvailsFilter,
  terms: Term<Date>[]): boolean {
  for (const term of terms) {

    const startDuringDuration = duration.from.getTime() >= term.duration.from.getTime() && duration.from.getTime() <= term.duration.to.getTime();
    const endDuringDuration = duration.to.getTime() <= term.duration.from.getTime() && duration.to.getTime() >= duration.to.getTime();
    const inDuration = startDuringDuration || endDuringDuration;

    const hasMedia = medias.some(media => term.medias.includes(media))

    const hasTerritories = territories.some(territory => term.territories.includes(territory));

    if (inDuration && hasMedia && hasTerritories && exclusive) {
      return false;
    } else if (inDuration && hasMedia && hasTerritories && term.exclusive) {
      return false;
    }
  }
  return true;
}