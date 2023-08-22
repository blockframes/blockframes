import { Component, ChangeDetectionStrategy, Optional, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
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
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { RequestAskingPriceComponent } from '@blockframes/movie/components/request-asking-price/request-asking-price.component';
import { scrollIntoView } from '@blockframes/utils/browser/utils';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements AfterViewInit {
  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)),
    tap(title => this.analytics.addTitlePageView(title)),
    shareReplay({ refCount: true, bufferSize: 1 })
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

  public requestSent = false;

  constructor(
    public route: ActivatedRoute,
    private movieService: MovieService,
    private functions: CallableFunctions,
    private analytics: AnalyticsService,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    @Optional() private intercom: Intercom
    ) { }

    ngAfterViewInit() {
      setTimeout(() => {
        scrollIntoView(document.querySelector('#top'));
      });
    }

  public openIntercom(): void {
    return this.intercom.show();
  }

  async requestScreener(movieId: string) {
    this.requestStatus.next('sending');
    await this.functions.call('requestScreener', { movieId: movieId, uid: this.authService.uid });
    this.requestStatus.next('sent');
    const title = await this.movieService.load(movieId);
    this.analytics.addTitle('screenerRequested', title);
    this.snackbar.open('Screener request successfully sent.', '', { duration: 3000 });
  }

  requestAskingPrice(movieId: string) {
    const ref = this.dialog.open(RequestAskingPriceComponent, {
      data: createModalData({ movieId, enhanced: true }, 'large'),
      autoFocus: false
    });
    ref.afterClosed().subscribe(isSent => {
      this.requestSent = !!isSent;
      this.cdr.markForCheck();
    });
  }
}
