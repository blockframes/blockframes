// Angular
import { Component, ChangeDetectionStrategy, HostBinding, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { MovieService } from '@blockframes/movie/+state';
import { EventService, Event } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { Screening } from '@blockframes/event/+state/event.firestore';
import { getCurrentApp } from '@blockframes/utils/apps';

// RxJs
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RequestAskingPriceComponent } from '../request-asking-price/request-asking-price.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'movie-screening',
  templateUrl: 'upcoming-screenings.component.html',
  styleUrls: ['./upcoming-screenings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingScreeningsComponent {
  @HostBinding('class') class = 'dark-contrast-theme';

  private app = getCurrentApp(this.route);

  public sessions = ['first', 'second', 'third', 'fourth', 'fifth'];

  public sessionCtrl = new FormControl(0);

  private movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.getValue(movieId))
  );

  public movieId: string = this.route.snapshot.paramMap.get('movieId');

  public ongoingScreenings$: Observable<Event<Screening>[]>;
  public futureScreenings$: Observable<Event<Screening>[]>;

  public orgs$ = this.movie$.pipe(
    switchMap(movie => this.orgService.valueChanges(movie.orgIds)),
    map(orgs => orgs.filter(org => org.appAccess[this.app]))
  );

  public buttonState$: Observable<boolean> = new Observable();
  public requestSent = false;

  constructor(
    private dialog: MatDialog,
    private eventService: EventService,
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private movieService: MovieService,
  ) {

    const now = new Date();
    const screenings$ = this.movie$.pipe(
      map(movie => ref => ref
        .where('isSecret', '==', false)
        .where('meta.titleId', '==', movie.id)
        .orderBy('end')
        .startAt(now)
      ),
      switchMap(q => this.eventService.queryByType(['screening'], q)),
      map((screenings: Event<Screening>[]) => screenings.sort(this.sortByDate).slice(0, 5)),
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.ongoingScreenings$ = screenings$.pipe(
      map(screenings => screenings.filter(screening => screening.start < now && screening.end > now)),
    );

    this.futureScreenings$ = screenings$.pipe(
      map(screenings => screenings.filter(screening => screening.start > now))
    );

    this.checkInvitationStatus();
  }

  askForInvitation(events: Event[]) {
    const event = events[this.sessionCtrl.value];
    this.invitationService.request(event.ownerOrgId).to('attendEvent', event.id);
  }

  private sortByDate(a: Event, b: Event): number {
    if (a.start.getTime() < b.start.getTime()) return -1
    if (a.start.getTime() > b.start.getTime()) return 1
    return 0
  }

  checkInvitationStatus() {
    const index = this.sessionCtrl.value;
    this.buttonState$ = combineLatest([
      this.futureScreenings$,
      this.invitationService.guestInvitations$
    ]).pipe(
      map(([screenings, invitations]) => invitations.some(invitation => invitation.eventId === screenings[index].id))
    )
  }

  requestAskingPrice() {
    const ref = this.dialog.open(RequestAskingPriceComponent, {
      data: { movieId: this.movieId },
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
