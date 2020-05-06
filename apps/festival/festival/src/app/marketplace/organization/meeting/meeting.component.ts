import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventService } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationQuery } from '@blockframes/organization/+state';

@Component({
  selector: 'festival-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingComponent {
  // @todo(#2711) switch ownerId to userId
  form = new EventForm({ type: 'meeting', ownerId: this.orgQuery.getActiveId() })

  constructor(
    private route: ActivatedRoute,
    private orgQuery: OrganizationQuery,
    private service: EventService,
    private invitationService: InvitationService,
    private snackbar: MatSnackBar
  ) {}

  async requestMeeting() {
    try {
      const event = this.form.value;
      const orgId = this.route.snapshot.paramMap.get('orgId');
      const eventId = await this.service.add(event);
      await this.invitationService.invite('org', orgId).from('org').to('attendEvent', eventId);
    } catch (err) {
      this.snackbar.open('Something wrong happen. Could not send invitation', 'close', { duration: 500 });
      console.error(err);
    }
  }
  
}
