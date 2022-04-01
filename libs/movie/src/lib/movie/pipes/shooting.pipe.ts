import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';
import { MovieShooting } from '@blockframes/shared/model';
import { territories } from '@blockframes/utils/static-model/static-model';
import { TerritoryValue } from '@blockframes/utils/static-model';
import { toDate } from '@blockframes/utils/helpers';

@Pipe({ name: 'shootingDates' })
export class ShootingDatesPipe implements PipeTransform {
  transform(shooting: MovieShooting) {
    if (!shooting.dates) {
      return 'No shooting date provided';
    } else if (shooting.dates.completed) {
      const date = toDate(shooting.dates.completed);
      const ended = formatDate(date, 'MMMM, y', 'en');
      return `Shooting completed on ${ended}`;
    } else if (shooting.dates.progress) {
      const date = toDate(shooting.dates.progress);
      const started = formatDate(date, 'MMMM, y', 'en');
      return `Shooting starting the ${started} and is still in progress`;
    } else if (shooting.dates.planned) {
      const { from, to } = shooting.dates.planned;
      const start = [from.period, from.month, from.year].filter(v => !!v).join(' ');
      const end = [to.period, to.month, to.year].filter(v => !!v).join(' ');
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
      return shooting.locations
        .map(({ cities, country }) => {
          const territory: TerritoryValue = territories[country];
          const allCities = cities.join(', ');
          return allCities ? `${territory} (${allCities})` : territory;
        })
        .join(', ');
    }
  }
}

@NgModule({
  declarations: [ShootingDatesPipe, ShootingLocationsPipe],
  exports: [ShootingDatesPipe, ShootingLocationsPipe],
})
export class ShootingModule {}
