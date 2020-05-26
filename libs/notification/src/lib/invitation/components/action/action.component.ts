import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Event } from '@blockframes/event/+state';
import { Invitation, InvitationService } from '../../+state';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'invitation-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionComponent implements OnInit {

  @Input() event: Event;
  @Input() invitation: Invitation;

  public canAction: boolean;

  constructor(
    private service: InvitationService,
    private authQuery: AuthQuery,
    private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.canAction = !!this.invitation && ((!(this.invitation.fromUser?.uid === this.authQuery.userId) && this.invitation.toOrg?.id === this.authQuery.orgId) || this.invitation.toUser?.uid === this.authQuery.userId);
  }

  accept(invitation: Invitation) {
    this.service.acceptInvitation(invitation);
    // Todo try to redirect user on the event page when user clics on close button (rename it into More details)
    this.snackBar.open('Invitation accepted', 'close', { duration: 2000 });
  }

  decline(invitation: Invitation) {
    this.service.declineInvitation(invitation);
    // Todo try to redirect user on the event page when user clics on close button (rename it into More details)
    this.snackBar.open('Invitation declined', 'close', { duration: 2000 });
  }

  /** Request the owner to accept invitation (automatically accepted if event is public) */
  request(event: Event) {
    const { ownerId, id } = event;
    this.service.request('org', ownerId).from('user').to('attendEvent', id);
  }
}
