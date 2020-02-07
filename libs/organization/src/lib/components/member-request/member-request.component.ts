import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { InvitationFromUserToOrganization } from '@blockframes/invitation/types';
import { PublicUser } from '@blockframes/auth/+state/auth.firestore';

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
    this.users = invitations.map(invitation => invitation.user);
  }

  public invitationColumns = {
    name: 'Name',
    surname: 'Lastname',
    email: 'Email Address'
  };

  get initialColumns() {
    return this.isAdmin
    ? [ 'name', 'surname', 'email', 'uid' ]
    : [ 'name', 'surname', 'email' ]
  }

  public findInvitation(uid: string) {
    return this.memberInvitations.find(invitation => invitation.user.uid === uid);
  }
}
