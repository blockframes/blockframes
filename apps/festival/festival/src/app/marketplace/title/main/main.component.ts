import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { getLabelBySlug, Scope } from '@blockframes/utils/static-model/staticModels';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { premiereType } from '@blockframes/movie/+state/movie.firestore';
import { formatNumber } from '@angular/common';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit {

  public movie$ = this.movieQuery.selectActive();

  constructor(
    private movieQuery: MovieQuery,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Main Info');
  }

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

  public getSalesCrew(movie: Movie, role: string, scope: Scope) {
    return movie.salesCast[role].map(cast => {
      return {
          role: cast.role,
          firstName: cast.firstName,
          lastName: cast.lastName,
          label: getLabelBySlug(scope, cast.role)
        }
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
