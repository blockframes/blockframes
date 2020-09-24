import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements OnInit {
  public movie$: Observable<Movie>;

  public navLinks = [
    mainRoute,
    artisticRoute,
    productionRoute,
    additionalRoute,
  {
    path: 'finance',
    label: 'Financing Conditions'
  },
  {
    path: 'avails',
    label: 'Avails'
  }];

  promoLinks = [
    'promo_reel_link',
    'scenario',
    'screener_link',
    'teaser_link',
    'presentation_deck',
    'trailer_link'
  ];

  constructor(
    private movieQuery: MovieQuery,
    ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
  }

}
