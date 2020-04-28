import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { InvitationFromUserToOrganization } from '@blockframes/invitation/+state/invitation.model';

@Component({
  selector: 'member-request',
  templateUrl: './member-request.component.html',
  styleUrls: ['./member-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MemberRequestComponent {
  @Output() accepted = new EventEmitter<InvitationFromUserToOrganization>();
  @Output() declined = new EventEmitter<InvitationFromUserToOrganization>();
  @Input() isAdmin: boolean;
  public users: PublicUser[];
  public memberInvitations: InvitationFromUserToOrganization[];

  @Input() set invitations(invitations: InvitationFromUserToOrganization[]) {
    this.memberInvitations = invitations;
    this.users = invitations.map(invitation => invitation.fromUser);
  }

  public invitationColumns = {
    firstName: 'FirstName',
    lastName: 'Lastname',
    email: 'Email Address'
  };

  get initialColumns() {
    return this.isAdmin
    ? [ 'firstName', 'lastName', 'email', 'uid' ]
    : [ 'firstName', 'lastName', 'email' ]
  }

  public findRequest(uid: string) {
    return this.memberInvitations.find(invitation => (invitation.fromUser.uid === uid && invitation.type === 'joinOrganization' && invitation.mode === 'request'));
  }
}
