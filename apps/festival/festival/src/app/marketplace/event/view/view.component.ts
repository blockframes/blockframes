import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '@blockframes/event/+state';
import { ActivatedRoute } from '@angular/router';
import { switchMap, pluck, tap, map } from 'rxjs/operators';
import { InvitationService } from '@blockframes/invitation/+state';
import { Event } from '@blockframes/event/+state/event.model';

@Component({
  selector: 'festival-event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewComponent {

  event$ = this.route.params.pipe(
    pluck('eventId'),
    switchMap((eventId: string) => this.service.queryDocs(eventId))
  );

  invitations$ = this.event$.pipe(
    switchMap(event => this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent').where('docId', '==', event.id))),
    tap(invitations => this.expected = invitations.length),
    map(invitations => invitations.filter(invitation => invitation.status === 'attended')),
    tap(invitations => this.attended = invitations.length)
  );

  expected = 0;
  attended = 0;

  constructor(
    private route: ActivatedRoute,
    private service: EventService,
    private invitationService: InvitationService,
  ) { }

  getDurationString(event: Event) {
    // calculate time difference
    const difference = Math.abs(event.end.getTime() - event.start.getTime());
    // convert difference to minutes
    const minutes = Math.floor(difference / 1000 / 60);
    // calculate total number of whole hours
    const rhours = Math.floor(minutes / 60);
    // calculate left over minutes
    const rminutes = Math.round(((minutes / 60) - rhours) * 60);

    let duration = '';
    if (!!rhours) {
      duration += rhours === 1 ? `${rhours} hour ` : `${rhours} hours `;
    }

    if (!!rhours && !!rminutes) {
      duration += 'and ';
    }

    if (rminutes > 0) {
      duration += rminutes === 1 ?  `${rminutes} minute` : `${rminutes} minutes`;
    }
    return duration;
  }
}
