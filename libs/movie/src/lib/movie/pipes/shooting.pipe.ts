import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';
import { MovieShooting } from '../+state/movie.firestore';
import { formatSlug } from '@blockframes/utils/pipes';
import { staticConsts } from '@blockframes/utils/static-model';

@Pipe({ name: 'shootingDates' })
export class ShootingDatesPipe implements PipeTransform {
  transform(shooting: MovieShooting) {
    if (!shooting.dates) {
      return 'No shooting date provided';
    } else if (shooting.dates.completed) {
      const ended = formatDate(shooting.dates.completed, 'MMMM, y', 'en');
      return `Shooting completed on ${ended}`;
    } else if (shooting.dates.progress) {
      const started = formatDate(shooting.dates.progress, 'MMMM, y', 'en');
      return `Shooting starting the ${started} and is still in progress`
    } else if (shooting.dates.planned) {
      const { shootingPeriod } = staticConsts;
      const { from, to } = shooting.dates.planned;
      const start = [shootingPeriod[from.period], from.month, from.year].filter(v => !!v).join(' ');
      const end = [shootingPeriod[to.period], to.month, to.year].filter(v => !!v).join(' ');
      return `Shooting is planned from ${start} until ${end}`;
    } else {
      return 'No shooting date provided';
    }
  }
}

@Pipe({ name: 'shootingLocations' })
export class ShootingLocationsPipe implements PipeTransform {
  transform(shooting: MovieShooting) {
    if (!shooting.locations.length) {
      return 'No location provided';
    } else {
      return shooting.locations.map(({ city, country }) => {
        const territory = formatSlug(country, 'TERRITORIES');
        return city ? `${territory} (${city})` : territory;
      }).join(', ');
    }
  }
}


@NgModule({
  declarations: [ShootingDatesPipe, ShootingLocationsPipe],
  exports: [ShootingDatesPipe, ShootingLocationsPipe]
})
export class ShootingModule {}