import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventService } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingComponent implements OnInit {
  // @todo(#2711) switch ownerId to userId
  public form = new EventForm({ type: 'meeting', ownerId: this.orgQuery.getActiveId() });

  constructor(
    private route: ActivatedRoute,
    private orgQuery: OrganizationQuery,
    private service: EventService,
    private invitationService: InvitationService,
    private snackbar: MatSnackBar,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Meeting');
  }

  async requestMeeting() {
    try {
      const event = this.form.value;
      const orgId = this.route.snapshot.paramMap.get('orgId');
      const eventId = await this.service.add(event);
      await this.invitationService.invite('org', orgId).from('org').to('attendEvent', eventId);
      this.snackbar.open('Your meeting request was successfully sent.', 'close', { duration: 2000 });
    } catch (err) {
      this.snackbar.open('Something wrong happen. Could not send invitation.', 'close', { duration: 5000 });
      console.error(err);
    }
  }

}
