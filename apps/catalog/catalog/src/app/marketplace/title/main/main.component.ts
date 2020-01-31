import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { MovieQuery, Movie } from '@blockframes/movie';
import { Observable } from 'rxjs';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: 'catalog-movie-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieMainComponent {
  @HostBinding('attr.page-id') pageId = 'catalog-movie-main';
  public movie$ = this.movieQuery.selectActive();
  public loading$ = this.movieQuery.selectLoading();
  constructor(private movieQuery: MovieQuery,) { }

  public hasStory({ story, promotionalDescription }: Movie): boolean {
    if(story.synopsis || promotionalDescription.keywords.length > 0 || promotionalDescription.keyAssets)
    return true;
  }

  public getPrize(prize) {
    return [`${prize.name}  ${prize.year}`, prize.prize,prize.premiere].join(' | ');
  }
  
  // TODO#1658 Update LANGUAGES static model to be RFC-5646 compliant
  public getStakeholder(movie: Movie, role: string) {
    const array = movie.main.stakeholders[role];
    return array.map(e => {
      if(e.countries && e.countries.length > 0) {
        return `${e.displayName} (${e.countries})`;
      }
      return e.displayName;
    }).join(', ');
  }

  public getSalesCast(movie: Movie, role: string) {
    return movie.salesCast[role].map(e => {
      if(e.role && e.role.length > 0) {
        return `${e.firstName} ${e.lastName} (${e.role})`;
      }
      return `${e.firstName} ${e.lastName}`;
    }).join(', ');
  }

  public hasBudget({ budget, salesInfo, movieReview}: Movie): boolean {
    if(budget.estimatedBudget ||
       budget.boxOffice.length > 0 ||
       salesInfo.certifications.length > 0||
       salesInfo.rating.length > 0||
       movieReview.length > 0)
       return true;
  }

  public budgetRange({ from, to }) {
    return (from && to) ? `$ ${from} - ${to}` : '';
  }

}
