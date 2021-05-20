// Angular
import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';
import { EventService, Event } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { Screening } from '@blockframes/event/+state/event.firestore';

// RxJs
import { map, take } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';

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

  public movie$ = this.query.selectActive();

  public screenings$: Observable<Event<Screening>[]>;

  public orgs$ = this.orgService.queryFromMovie(this.query.getActive());

  public buttonState$: Observable<boolean> = new Observable();

  constructor(
    private query: MovieQuery,
    private eventService: EventService,
    private invitationService: InvitationService,
    private orgService: OrganizationService,
  ) {
    const q = ref => ref
      .where('isSecret', '==', false)
      .where('meta.titleId', '==', this.query.getActiveId())
      .orderBy('end')
      .startAt(new Date())

    this.screenings$ = this.eventService.queryByType(['screening'], q).pipe(
      map((screenings: Event<Screening>[]) => screenings.sort(this.sortByDate).slice(0, 5))
    )

    this.checkInvitationStatus();
  }

  askForInvitation(events: Event[]) {
    const eventId = events[this.sessionCtrl.value].id;
    this.orgs$.pipe(take(1)).subscribe(orgs => {
      orgs.forEach(org => this.invitationService.request(org.id).to('attendEvent', eventId))
      this.checkInvitationStatus();
    })
  }

  private sortByDate(a: Event, b: Event): number {
    if (a.start.getTime() < b.start.getTime()) return -1
    if (a.start.getTime() > b.start.getTime()) return 1
    return 0
  }

  checkInvitationStatus() {
    const index = this.sessionCtrl.value;
    this.buttonState$ = combineLatest([
      this.screenings$,
      this.invitationService.guestInvitations$
    ]).pipe(
      map(([screenings, invitations]) => !!invitations.some(invitation => invitation.eventId === screenings[index].id))
    )
  }
}
