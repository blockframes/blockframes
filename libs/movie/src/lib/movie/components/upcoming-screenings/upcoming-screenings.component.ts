// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';
import { EventService, Event } from '@blockframes/event/+state';
import { InvitationQuery, InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService } from '@blockframes/organization/+state';

// RxJs
import { map, take, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'movie-screening',
  templateUrl: 'upcoming-screenings.component.html',
  styleUrls: ['./upcoming-screenings.component.scss'],
  host: {
    class: 'dark-contrast-theme'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingScreeningsComponent implements OnInit {

  public sessions = ['first', 'second', 'third', 'fourth', 'fifth'];

  public sessionCtrl = new FormControl(0);

  public movie$ = this.query.selectActive();

  public screenings$ = this.eventService.filterScreeningsByMovieId(this.query.getActive().id).pipe(
    map(screenings => screenings.sort(this.sortByDate).slice(0, 5)));

  public orgs$ = this.orgService.queryFromMovie(this.query.getActive());

  public buttonState$: Observable<boolean> = new Observable();

  constructor(
    private query: MovieQuery,
    private eventService: EventService,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private orgService: OrganizationService,
    )
  { }

  ngOnInit() {
    this.checkInvitationStatus();
  }

  askForInvitation(events: Event[]) {
    const eventId = events[this.sessionCtrl.value].id;
    this.orgs$.pipe(take(1)).subscribe(orgs => {
      orgs.forEach(org => {
        this.invitationService.request('org', org.id).from('user').to('attendEvent', eventId)
      })
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
    this.buttonState$ = this.screenings$.pipe(
      switchMap(screening => {
        return this.invitationQuery.whereCurrentUserIsGuest().pipe(
          map(invits => !!invits.filter(invit => invit.docId === screening[index].id).length));
      })
    )
  }
}
