import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventService } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { AuthQuery } from '@blockframes/auth/+state';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private invitationService: InvitationService,
    private snackbar: MatSnackBar
  ) {}

  async requestMeeting() {
    try {
      const event = this.form.value;
      const orgId = this.route.snapshot.paramMap.get('orgId');
      const eventId = await this.service.add(event);
      await this.invitationService.invite('org', orgId).from('user').to('attendEvent', eventId);
    } catch (err) {
      this.snackbar.open('Something wrong happen. Could not send invitation', 'close', { duration: 500 });
      console.error(err);
    }
  }
  
}
