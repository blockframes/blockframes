import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';

@Component({
  selector: 'festival-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public orgs$: Observable<Organization[]>;

  public navLinks = [
    {
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
      path: 'finance',
      label: 'Financing Conditions'
    },
    {
      path: 'screenings',
      label: 'Upcoming Screenings'
    }
  ];

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
    private orgService: OrganizationService
    ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.orgs$ = this.movieQuery.selectActiveId().pipe(
      switchMap(movieId => this.orgService.getValue(ref => ref.where('movieIds', 'array-contains', movieId)))
    );
  }

}
