// Angular
import { Component, ChangeDetectionStrategy, HostBinding, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';
import { EventService, Event } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { Screening } from '@blockframes/event/+state/event.firestore';

// RxJs
import { map, shareReplay } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RequestAskingPriceComponent } from '../request-asking-price/request-asking-price.component';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';

@Component({
  selector: 'movie-screening',
  templateUrl: 'upcoming-screenings.component.html',
  styleUrls: ['./upcoming-screenings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingScreeningsComponent {
  @HostBinding('class') class = 'dark-contrast-theme';

  public sessions = ['first', 'second', 'third', 'fourth', 'fifth'];

  public sessionCtrl = new FormControl(0);

  public movieId = this.query.getActiveId();

  public ongoingScreenings$: Observable<Event<Screening>[]>;
  public futureScreenings$: Observable<Event<Screening>[]>;

  public orgs$ = this.orgService.queryFromMovie(this.query.getActive());

  public buttonState$: Observable<boolean> = new Observable();
  public requestSent = false;

  constructor(
    private query: MovieQuery,
    private dialog: MatDialog,
    private eventService: EventService,
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) {
    const now = new Date();
    const q = ref => ref
      .where('isSecret', '==', false)
      .where('meta.titleId', '==', this.query.getActiveId())
      .orderBy('end')
      .startAt(now)

    const screenings$ = this.eventService.queryByType(['screening'], q).pipe(
      map((screenings: Event<Screening>[]) => screenings.sort(this.sortByDate).slice(0, 5)),
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.ongoingScreenings$ = screenings$.pipe(
      map(screenings => screenings.filter(screening => screening.start < now && screening.end > now)),
    );

    this.futureScreenings$ = screenings$.pipe(
      map(screenings => screenings.filter(screening => screening.start > now ))
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
