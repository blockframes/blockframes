import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
import { OrganizationService } from '@blockframes/organization/+state';
import { ActivatedRoute } from '@angular/router';
import { Intercom } from 'ng-intercom';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { pluck, shareReplay, switchMap, tap } from 'rxjs/operators';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent {
  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    tap((titleId: string) => this.analytics.addPageView('title', titleId)),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  public orgs$ = this.movie$.pipe(
    switchMap(movie => this.orgService.valueChanges(movie.orgIds))
  );

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
    private route: ActivatedRoute,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private analytics: AnalyticsService,
    @Optional() private intercom: Intercom
  ) { }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
