import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
import { EventService } from '@blockframes/event/+state';
import { map } from 'rxjs/operators';
import { RequestAskingPriceComponent } from '@blockframes/movie/components/request-asking-price/request-asking-price.component';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';

@Component({
  selector: 'festival-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public orgs$: Observable<Organization[]>;
  public eventId$: Observable<string | null>;
  public movieId = this.movieQuery.getActiveId();
  public requestSent = new BehaviorStore(false);

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
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private eventService: EventService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.orgs$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds);

    const q = ref => ref
    .where('isSecret', '==', false)
    .where('meta.titleId', '==', this.movieId)
    .where('type', '==', 'screening')
    .orderBy('end', 'asc')
    .startAt(new Date());

    this.eventId$ = this.eventService.valueChanges(q).pipe(
      map(events => events.filter(e => e.start < new Date())),
      map(events => events.length ? events[events.length - 1].id : null)
    );
  }

  getEmails(orgs: Organization[]) {
    return orgs.map(org => org.email).join(', ')
  }

  requestAskingPrice() {
    const ref = this.dialog.open(RequestAskingPriceComponent, {
      data: { movieId: this.movieId },
      maxHeight: '80vh',
      maxWidth: '650px',
      autoFocus: false
    });
    ref.afterClosed().subscribe(isSent => {
      if (isSent) {
        this.requestSent.value = true;
      }
    });
  }
}
