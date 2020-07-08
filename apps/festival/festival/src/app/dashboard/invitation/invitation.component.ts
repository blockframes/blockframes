import { Component, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery, InvitationService } from '@blockframes/invitation/+state';
import { take } from 'rxjs/operators';

@Component({
  selector: 'festival-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent {

  // Invitation that require an action
  invitations$ = this.query.toMe();

  constructor(private query: InvitationQuery, private service: InvitationService) { }

  acceptAll() {
    this.invitations$.pipe(take(1)).subscribe(invitations => invitations.forEach(invitation => {
      this.service.acceptInvitation(invitation)
    }))
  }
}
