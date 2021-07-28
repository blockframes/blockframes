import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
import { Event, EventService } from '@blockframes/event/+state';

@Component({
  selector: 'festival-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements OnInit, OnDestroy {
  public movie$: Observable<Movie>;
  public orgs$: Observable<Organization[]>;
  public screeningOngoing = false;
  public eventId: string;
  public movieId = this.movieQuery.getActiveId();
  public sub: Subscription;

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
    private eventService: EventService
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

    const events$ = this.eventService.queryByType(['screening'], q);
    this.sub = events$.subscribe(screenings => {
      screenings.filter(s => s.start < new Date());
      screenings.sort(this.sortByDate);

      if (screenings.length) {
        this.eventId = screenings[0].id;
        return this.screeningOngoing = true;
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private sortByDate(a: Event, b: Event): number {
    if (a.start.getTime() < b.start.getTime()) return -1
    if (a.start.getTime() > b.start.getTime()) return 1
    return 0
  }
}
