import { Component, ChangeDetectionStrategy, OnInit, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { Router } from '@angular/router';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public orgs$: Observable<Organization[]>;

  public navLinks = [
    mainRoute,
    artisticRoute,
    productionRoute,
    additionalRoute,
    {
      path: 'avails',
      label: 'Avails'
    }
  ];

  promoLinks = [
    'scenario',
    'presentation_deck',
  ];

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private router: Router,
    @Optional() private intercom: Intercom
  ) { }

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.orgs$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds);
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
