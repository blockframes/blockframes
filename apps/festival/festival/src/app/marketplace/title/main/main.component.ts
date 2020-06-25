import { Component, ChangeDetectionStrategy } from '@angular/core';
import { getLabelBySlug, Scope } from '@blockframes/utils/static-model/staticModels';
import { staticModels } from '@blockframes/utils/static-model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { premiereType } from '@blockframes/movie/+state/movie.firestore';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'festival-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent {
  public movie$ = this.movieQuery.selectActive();
  public castRoles = staticModels.CREW_ROLES;
  constructor(private movieQuery: MovieQuery) { }

  public hasStory({ story, promotionalDescription }: Movie): boolean {
    return !!(story.synopsis || promotionalDescription.keywords.length > 0 || promotionalDescription.keyAssets);
  }

  public getPrize(prize) {
    const festivalYear = prize.year ? `${prize.year}` : ''
    const festivalInfo = `${prize.name}  ${festivalYear}`;
    const premiere = `${premiereType[prize.premiere]} Premiere`;
    return [festivalInfo, prize.prize , prize.premiere ? premiere : null].filter(value => !!value).join(' | ');
  }

  // TODO#1658 Update LANGUAGES static model to be RFC-5646 compliant
  public getStakeholder(movie: Movie, role: string) {
    return movie.main.stakeholders[role].map(stakeholder => {
      return (stakeholder.countries && !!stakeholder.countries.length)
        ? `${stakeholder.displayName} (${stakeholder.countries.map(country => getLabelBySlug('TERRITORIES', country))})`
        :  stakeholder.displayName;
    }).join(', ');
  }

  public getSalesCast(movie: Movie, role: string, scope: Scope) {
    return movie.salesCast[role].map(cast => {
      return (cast.role && !! cast.role.length)
        ? `${cast.firstName} ${cast.lastName} (${getLabelBySlug(scope, cast.role)})`
        : `${cast.firstName} ${cast.lastName}`;
    }).join(', ');
  }

  public getCrewMember(movie: Movie, role: string) {
    const result = movie.salesCast.crew.filter(crew => crew.role === role);
    console.log(result);
    return result.forEach(crewMember => {
      console.log(crewMember.firstName);
      return `${crewMember.firstName} ${crewMember.lastName}`;
    });
  }

  public hasBudget({ budget, salesInfo, movieReview}: Movie): boolean {
    return !!(
      budget.boxOffice.length ||
      salesInfo.certifications.length ||
      salesInfo.rating.length ||
      movieReview.length
    );
  }

  public hasTerritory({ budget }: Movie) {
    return (budget.boxOffice.some(movie => movie.territory));
  }

  public budgetRange({ from, to }) {
    return (from && to) ? `$ ${formatNumber(from, 'en-US')} - ${formatNumber(to, 'en-US')}` : '';
  }
}
