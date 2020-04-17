import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventForm } from '../../form/event.form';
import { EventService } from '../../+state/event.service';
import { InvitationToAnEvent }  from '@blockframes/invitation/+state/invitation.firestore.ts';
import { InvitationService }  from '@blockframes/invitation/+state/invitation.service';
import { createEventInvitation }  from '@blockframes/invitation/+state/invitation.model';
import { FormControl } from '@angular/forms';
import { createPublicUser } from '@blockframes/user/+state/user.model';
import { getPublicOrg } from '@blockframes/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { AuthQuery } from '@blockframes/auth/+state';
import { PublicUser } from '@blockframes/user/types';
import { scaleIn } from '@blockframes/utils/animations/fade';

@Component({
  selector: 'event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.Default  // required for changes on "pristine" for the save button
})
export class EventEditComponent {

  @Input() form = new EventForm();
  @Input() invitations: InvitationToAnEvent[] = [];
  invitationForm = new FormControl();

  constructor(
    private service: EventService,
    private invitationService: InvitationService,
    private orgQuery: OrganizationQuery,
    private authQuery: AuthQuery,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  
  get meta() {
    return this.form.get('meta');
  }

  save() {
    if (this.form.valid && this.form.dirty) {
      this.service.update(this.form.value);
      this.form.markAsPristine();
    }
  }

  async remove() {
    await this.service.remove(this.form.value.id);
    this.router.navigate(['../..'], { relativeTo: this.route })
  }

  /** Send an invitation to a list of persons, either email or existing user  */
  invite() {
    if (this.invitationForm.dirty && this.invitationForm.valid) {
      const event = this.form.value;
      const guests: (string | PublicUser)[] = [this.invitationForm.value];
      const invitations = guests.map(guest => {
        const invite: Partial<InvitationToAnEvent> = { docId: event.id, mode: 'invitation' };
        if (typeof guest === 'string') invite.toEmail = guest;
        if (typeof guest === 'object') invite.toUser = createPublicUser(guest);
        if (event.type === 'screening') invite.fromOrg = getPublicOrg(this.orgQuery.getActive());
        if (event.type === 'meeting') invite.fromUser = createPublicUser(this.authQuery.user);
        return createEventInvitation(invite);
      });
      this.invitationService.add(invitations);
    }
  }
}
