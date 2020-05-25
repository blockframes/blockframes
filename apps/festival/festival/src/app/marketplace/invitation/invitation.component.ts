import { Component, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';

@Component({
  selector: 'festival-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent {

  // Invitation that require an action
  invitations$ = this.query.toMe();

  constructor(private query: InvitationQuery) { }
}
