import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '@blockframes/event/+state';
import { ActivatedRoute } from '@angular/router';
import { switchMap, pluck, tap } from 'rxjs/operators';
import { InvitationService } from '@blockframes/invitation/+state';

@Component({
  selector: 'festival-event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewComponent {

  event$ = this.route.params.pipe(
    pluck('eventId'),
    switchMap((eventId: string) => this.service.queryDocs(eventId)),
  );

  invitations$ = this.event$.pipe(
    switchMap(event => this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent').where('docId', '==', event.id))),
    tap(invitations => {
      this.expected = invitations.length;
      this.attended = invitations.filter(invitation => invitation.status === 'attended').length
    })
  );

  expected = 0;
  attended = 0;

  constructor(
    private route: ActivatedRoute,
    private service: EventService,
    private invitationService: InvitationService,
  ) { }

}
