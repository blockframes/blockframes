import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventService } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { AuthQuery } from '@blockframes/auth/+state';

@Component({
  selector: 'festival-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingComponent {
  form = new EventForm({ type: 'meeting', ownerId: this.autQuery.userId })

  constructor(
    private route: ActivatedRoute,
    private autQuery: AuthQuery,
    private service: EventService,
    private invitationService: InvitationService
  ) {}

  async requestMeeting() {
    const event = this.form.value;
    const orgId = this.route.snapshot.paramMap.get('orgId');
    const write = this.service.batch();
    const eventId = await this.service.add(event, { write });
    this.invitationService.request('org', orgId).from('user').to('attendEvent', eventId, write);
  }
  
}
