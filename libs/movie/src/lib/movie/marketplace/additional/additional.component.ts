import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Movie, MovieStakeholders } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: 'movie-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdditionalComponent implements OnInit {

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

}
