import { Media, Territory } from "@blockframes/utils/static-model";
import { Term } from "../term/+state/term.model";

interface AvailsFilter { medias: Media[], duration: { from: Date, to: Date }, territories: Territory[], exclusive: boolean }

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

    const isInTimeSpan = duration.from.getTime() > term.duration.from.getTime()
      && duration.to.getTime() < term.duration.to.getTime();

    const hasMedia = medias.every(media => term.medias.includes(media))

    const hasTerritories = territories.every(territory => term.territories.includes(territory));

    if (isInTimeSpan && hasMedia && hasTerritories && exclusive) {
      return false;
    } else if (isInTimeSpan && hasMedia && hasTerritories && term.exclusive) {
      return false;
    }
  }
  return true;
}