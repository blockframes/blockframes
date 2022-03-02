import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
import { EventService } from '@blockframes/event/+state';
import { distinctUntilChanged, map, pluck, switchMap, tap } from 'rxjs/operators';
import { RequestAskingPriceComponent } from '@blockframes/movie/components/request-asking-price/request-asking-price.component';
import { MatDialog } from '@angular/material/dialog';
import { MovieService } from '@blockframes/movie/+state';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';

@Component({
  selector: 'festival-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent  {
  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    distinctUntilChanged(),
    tap((movieId: string) => this.analytics.addPageViewEvent('title', movieId)),
    switchMap((movieId: string) => this.movieService.getValue(movieId))
  );

  public orgs$ = this.movie$.pipe(
    switchMap(movie => this.orgService.valueChanges(movie.orgIds)),
  );

  public eventId$ = this.movie$.pipe(
    map(movie => ref => ref
      .where('isSecret', '==', false)
      .where('meta.titleId', '==', movie.id)
      .where('type', '==', 'screening')
      .orderBy('end', 'asc')
      .startAt(new Date())
    ),
    switchMap(q =>  this.eventService.valueChanges(q)),
    map(events => events.filter(e => e.start < new Date())),
    map(events => events.length ? events[events.length - 1].id : null)
  )

  public requestSent = false;

  public navLinks: RouteDescription[] = [
    mainRoute,
    artisticRoute,
    productionRoute,
    additionalRoute,
    {
      path: 'screenings',
      label: 'Upcoming Screenings'
    }
  ];

  promoLinks = [
    'scenario',
    'presentation_deck',
    'moodboard'
  ];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private eventService: EventService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private analytics: AnalyticsService
  ) { }

  getEmails(orgs: Organization[]) {
    return orgs.map(org => org.email).join(', ')
  }

  requestAskingPrice(movieId: string) {
    const ref = this.dialog.open(RequestAskingPriceComponent, {
      data: { movieId },
      maxHeight: '80vh',
      maxWidth: '650px',
      autoFocus: false
    });
    ref.afterClosed().subscribe(isSent => {
      this.requestSent = !!isSent;
      this.cdr.markForCheck();
    });
  }
}
