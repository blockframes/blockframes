// Angular
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';
import { EventService, Event } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';

// RxJs
import { map, take } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'movie-screening',
  templateUrl: 'upcoming-screenings.component.html',
  styleUrls: ['./upcoming-screenings.component.scss'],
  host: {
    class: 'dark-contrast-theme'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingScreeningsComponent {

  public sessions = {
    0: 'first',
    1: 'second',
    2: 'third',
    3: 'fourth',
    4: 'fifth'
  };
  public sessionCtrl = new FormControl(0);

  public movie$ = this.query.selectActive();

  public screenings$ = this.eventService.filterScreeningsByMovieId(this.query.getActive().id).pipe(
    map(screenings => screenings.sort(this.sortByDate).slice(0, 5)));

  public orgs$ = this.orgService.queryFromMovie(this.query.getActive());

  public invitationWasSent = false;

  constructor(
    private query: MovieQuery,
    private eventService: EventService,
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef) { }

  askForInvitation(events: Event[]) {
    const eventId = events[this.sessionCtrl.value].id;
    this.orgs$.pipe(take(1)).subscribe(orgs => {
      orgs.forEach(org => {
        this.invitationService.request('org', org.id).from('user').to('attendEvent', eventId)
      })
      this.invitationWasSent = true;
      this.cdr.markForCheck();
    })
  }

  private sortByDate(a: Event, b: Event): number {
    if (a.start.getTime() < b.start.getTime()) return -1
    if (a.start.getTime() > b.start.getTime()) return 1
    return 0
  }
}
