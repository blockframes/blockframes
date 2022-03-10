import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { PublicUser } from '@blockframes/model';
import { Invitation } from '@blockframes/model';

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
    this.users = invitations.map(invitation => invitation.fromUser);
  }


  public findRequest(uid: string) {
    return this.memberInvitations.find(invitation => (invitation.fromUser.uid === uid && invitation.type === 'joinOrganization' && invitation.mode === 'request'));
  }
}
