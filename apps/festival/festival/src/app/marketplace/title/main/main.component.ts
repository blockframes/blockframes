import { Component, ChangeDetectionStrategy } from '@angular/core';
import { getLabelBySlug, Scope } from '@blockframes/utils/static-model/staticModels';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { staticConsts } from '@blockframes/utils/static-model';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'festival-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent {
  public movie$ = this.movieQuery.selectActive();
  constructor(private movieQuery: MovieQuery) { }

  public hasStory({ synopsis, keywords, keyAssets }: Movie): boolean {
    return !!(synopsis || keywords.length > 0 || keyAssets);
  }

  public getPrize(prize) {
    const festivalYear = prize.year ? `${prize.year}` : ''
    const festivalInfo = `${prize.name}  ${festivalYear}`;
    const premiere = `${staticConsts.premiereType[prize.premiere]} Premiere`;
    return [festivalInfo, prize.prize , prize.premiere ? premiere : null].filter(value => !!value).join(' | ');
  }

  // TODO#1658 Update LANGUAGES static model to be RFC-5646 compliant
  public getStakeholder(movie: Movie, role: string) {
    return movie.stakeholders[role].map(stakeholder => {
      return (stakeholder.countries && !!stakeholder.countries.length)
        ? `${stakeholder.displayName} (${stakeholder.countries.map(country => getLabelBySlug('TERRITORIES', country))})`
        :  stakeholder.displayName;
    }).join(', ');
  }

  public getSalesCast(movie: Movie, role: string, scope: Scope) {
    return movie.cast[role].map(cast => {
      return (cast.role && !! cast.role.length)
        ? `${cast.firstName} ${cast.lastName} (${getLabelBySlug(scope, cast.role)})`
        : `${cast.firstName} ${cast.lastName}`;
    }).join(', ');
  }

  public getProducers(movie: Movie, scope: Scope) {
    return movie.producers.map(producer => {
      return (producer.role && !! producer.role.length)
        ? `${producer.firstName} ${producer.lastName} (${getLabelBySlug(scope, producer.role)})`
        : `${producer.firstName} ${producer.lastName}`;
    }).join(', ');
  }

  public getSalesCrew(movie: Movie, scope: Scope) {
    return movie.crew.map(crew => {
      return {
          role: crew.role,
          firstName: crew.firstName,
          lastName: crew.lastName,
          label: getLabelBySlug(scope, crew.role)
        }
    });
  }

  public hasBudget({ boxOffice, rating, certifications, review}: Movie): boolean {
    return !!(
      boxOffice.length ||
      certifications.length ||
      rating.length ||
      review.length
    );
  }

  public hasTerritory({ boxOffice }: Movie) {
    return (boxOffice.some(movie => movie.territory));
  }

  public budgetRange({ from, to }) {
    return (from && to) ? `$ ${formatNumber(from, 'en-US')} - ${formatNumber(to, 'en-US')}` : '';
  }
}
