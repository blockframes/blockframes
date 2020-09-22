import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements OnInit {
  public movie$: Observable<Movie>;

  public navLinks = [{
    path: 'main',
    label: 'Main Information'
  },
  {
    path: 'artistic',
    label: 'Artistic Information'
  },
  {
    path: 'additional',
    label: 'Additional Information'
  },
  {
    path: 'production',
    label: 'Production Environment'
  },
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
