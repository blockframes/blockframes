import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { InvitationService } from '@blockframes/invitation/+state';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
import { EventService } from '@blockframes/event/+state';
import { map, pluck, switchMap } from 'rxjs/operators';

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
  public event$: Observable<unknown>;
  public movieId = this.movieQuery.getActiveId();

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

  // invitations$ = this.event$.pipe(
  //   switchMap(event => this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent').where('eventId', '==', event.id)))
  // );

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private invitationService: InvitationService
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

    this.event$ = this.eventService.valueChanges(q);
    this.event$.subscribe(console.log);
  }
}
