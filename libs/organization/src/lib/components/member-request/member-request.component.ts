import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { PublicUser } from '@blockframes/auth/+state/auth.firestore';
import { Invitation } from '@blockframes/notification/invitation/+state/invitation.model';

@Component({
  selector: 'member-request',
  templateUrl: './member-request.component.html',
  styleUrls: ['./member-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MemberRequestComponent {
  @Output() accepted = new EventEmitter<Invitation>();
  @Output() declined = new EventEmitter<Invitation>();
  @Input() isAdmin: boolean;
  public users: PublicUser[];
  public memberInvitations: Invitation[];

  @Input() set invitations(invitations: Invitation[]) {
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
