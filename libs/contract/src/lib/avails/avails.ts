import { Media, Territory } from "@blockframes/utils/static-model";
import { Term } from "../term/+state/term.model";
import { Timestamp } from './avails.spec';

interface AvailsFilter { medias: Media[], duration: { from: Date, to: Date }, territories: Territory[], exclusive: boolean }

export function filterAvail({ medias, duration, territories, exclusive }: AvailsFilter,
  terms: Term<Date>[]): Term<Timestamp>[] {
  const occupiedTerms = []
  for (const term of terms) {
    if (exclusive) {
      if (duration.from.getTime() > term.duration.from.getTime() && duration.to.getTime() < term.duration.to.getTime()) {

        if (medias.every(media => term.medias.includes(media))) {
          if (territories.every(territory => term.territories.includes(territory))) {

            occupiedTerms.push(term);
          }
        }
      }
    } else {
      if (term.exclusive) {
        if (duration.from.getTime() > term.duration.from.getTime() && duration.to.getTime() < term.duration.to.getTime()) {

          if (medias.every(media => term.medias.includes(media))) {

            if (territories.every(territory => term.territories.includes(territory))) {

              occupiedTerms.push(term);
            }
          }
        }
      }
    }
  }
  return occupiedTerms
}

export function filterSales({ medias, duration, territories, exclusive }: AvailsFilter,
  terms: Term<Date>[]): boolean {
  const hasOnGoingSales = []
  for (const term of terms) {

    const isInTimeSpan = duration.from.getTime() > term.duration.from.getTime()
      && duration.to.getTime() < term.duration.to.getTime();

    const hasMedia = medias.every(media => term.medias.includes(media))

    const hasTerritories = territories.every(territory => term.territories.includes(territory));

    if (isInTimeSpan && hasMedia && hasTerritories && exclusive) {
      hasOnGoingSales.push(true)
    } else if (isInTimeSpan && hasMedia && hasTerritories && term.exclusive) {
      hasOnGoingSales.push(true)
    }
  }
  if(!hasOnGoingSales.length) hasOnGoingSales.push(false)
  return !hasOnGoingSales.every(x => x);
}