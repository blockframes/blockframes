import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-movie-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieFinanceComponent implements OnInit {

  public movie$ = this.movieQuery.selectActive();
  public loading$ = this.movieQuery.selectLoading();

  constructor(
    private movieQuery: MovieQuery,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Financing Conditions');
  }

  public budgetRange({ from, to }) {
    return (from && to) ? `$ ${from} - ${to}` : '';
  }

  public hasBudget({ boxOffice, rating, certifications, review}: Movie): boolean {
    return !!(
      boxOffice.length ||
      certifications.length ||
      rating.length ||
      review.length
    )
  }

  public hasTerritory({ boxOffice }: Movie) {
    return (boxOffice.some(movie => movie.territory));
  }

}
