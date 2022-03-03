import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '@blockframes/movie/+state';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'catalog-movie-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieFinanceComponent implements OnInit {

  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId))
  );

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Financing Conditions');
  }

  public budgetRange({ from, to }) {
    return (from && to) ? `$ ${from} - ${to}` : '';
  }

  public hasBudget({ boxOffice, rating, certifications, review }: Movie): boolean {
    return !!(
      boxOffice.length ||
      certifications.length ||
      rating.length ||
      review.length
    )
  }

}
