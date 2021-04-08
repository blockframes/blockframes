import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Invitation, InvitationService } from './+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'invitation-view',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent {

  // Invitation that require an action
  invitations$ = this.service.myInvitations$.pipe(
    tap(invitations => {
      !!invitations.length ?
        this.dynTitle.setPageTitle('Invitations List') :
        this.dynTitle.setPageTitle('Invitations List', 'Empty');
    })
  )

  constructor(
    private service: InvitationService,
    private dynTitle: DynamicTitleService,
  ) { }

  acceptAll(invitations: Invitation[]) {
    const pendingInvitations = invitations.filter(invitation => invitation.status === 'pending');
    for (const invitation of pendingInvitations) {
      this.service.acceptInvitation(invitation);
    }
  }
}
