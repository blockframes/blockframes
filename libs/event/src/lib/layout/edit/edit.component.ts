import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventForm } from '../../form/event.form';
import { EventService } from '../../+state/event.service';
import { InvitationToAnEvent }  from '@blockframes/invitation/+state/invitation.firestore.ts';
import { InvitationService }  from '@blockframes/invitation/+state/invitation.service';
import { createEventInvitation }  from '@blockframes/invitation/+state/invitation.model';
import { createPublicUser } from '@blockframes/user/+state/user.model';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { getPublicOrg } from '@blockframes/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { AuthQuery } from '@blockframes/auth/+state';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { createAlgoliaUserForm, AlgoliaUser } from '@blockframes/utils/algolia';
import { createImgRef } from '@blockframes/utils/image-uploader';

function algoliaToPublicUser(user: AlgoliaUser): PublicUser {
  return {
    uid: user.objectID,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: createImgRef(user.avatar),
  }
}

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
  invitationForm = createAlgoliaUserForm();

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

  /** Send an invitation to a list of persons, either to existing user or by creating user  */
  invite() {
    if (this.invitationForm.dirty && this.invitationForm.valid) {
      const event = this.form.value;
      const guests = this.invitationForm.value;
      const invitations = guests.map(guest => {
        const invite: Partial<InvitationToAnEvent> = { docId: event.id, mode: 'invitation' };
        const org = this.orgQuery.getActive();
        // transform algolia user to public user
        invite.toUser = algoliaToPublicUser(guest);
        if (event.type === 'screening') invite.fromOrg = getPublicOrg(org);
        if (event.type === 'meeting') invite.fromUser = createPublicUser(this.authQuery.user);
        return createEventInvitation(invite);
      });
      this.invitationService.add(invitations);
    }
  }
}
