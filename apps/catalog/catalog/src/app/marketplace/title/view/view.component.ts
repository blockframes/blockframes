import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
import { OrganizationService } from '@blockframes/organization/service';
import { ActivatedRoute } from '@angular/router';
import { Intercom } from 'ng-intercom';
import { MovieService } from '@blockframes/movie/service';
import { pluck, shareReplay, switchMap, tap } from 'rxjs/operators';
import { AnalyticsService } from '@blockframes/analytics/service';
import { RequestStatus } from '@blockframes/model';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/service';
import { CallableFunctions } from 'ngfire';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent {
  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)),
    tap(title => this.analytics.addTitlePageView(title)),
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

  requestStatus = new BehaviorSubject<RequestStatus>('available');
  screenerRequest: Record<RequestStatus, string> = {
    available: 'Ask for the Screener',
    sending: 'Sending...',
    sent: 'Screener requested'
  };

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private functions: CallableFunctions,
    private analytics: AnalyticsService,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    @Optional() private intercom: Intercom
  ) { }

  public openIntercom(): void {
    return this.intercom.show();
  }


  async requestScreener(movieId: string) {
    this.requestStatus.next('sending');
    await this.functions.call('requestScreener', { movieId: movieId, uid: this.authService.uid });
    this.requestStatus.next('sent');
    // const title = await this.movieService.load(movieId);
    //this.analytics.addTitle('screenerRequested', title); // TODO #8128
    this.snackbar.open('Screener request successfully sent.', '', { duration: 3000 });
  }
}
