// Angular 
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';
import { EventService, Event } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService } from '@blockframes/organization/+state';

// RxJs
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'movie-screening',
  templateUrl: 'screening.component.html',
  styleUrls: ['./screening.component.scss'],
  host: {
    class: 'dark-contrast-theme'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningComponent {

  public sessionCtrl = new FormControl('first');

  public movie$ = this.query.selectActive();

  public screenings$ = this.eventService.filterScreeningsByMovieId(this.query.getActive().id).pipe(
    map(screenings => screenings.sort(this.sortByDate)));

  public org = this.organizationService.findOrgByMovieId(this.query.getActive().id);

  public invitationWasSent = false;

  constructor(
    private query: MovieQuery,
    private eventService: EventService,
    private invitationService: InvitationService,
    private organizationService: OrganizationService,
    private cdr: ChangeDetectorRef) {
    /*     this.eventService.add({
          allDay: false, draggable: false, end: new Date(new Date().getTime() + 500000000), start: new Date(new Date().getTime() + 400000000),
          movie: this.query.getActive(), id: Math.random().toString(), title: 'second', org: this.org.getActive(), type: 'screening',
          meta: { titleId: this.query.getActive().id, }, ownerId: this.org.getActive().id
        }) */
  }

  askForInvitation(events: Event[]) {
    const eventId = this.sessionCtrl.value === 'first' ? events[0].id : events[1].id;
    this.org.pipe(take(1)).subscribe(org => {
      console.log(org)
      this.invitationService.request('org', org[0].id).from('user').to('attendEvent', eventId)
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