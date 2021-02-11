import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Event } from '@blockframes/event/+state';
import { Invitation, InvitationService } from '../../+state';

@Component({
  selector: 'invitation-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionComponent {

  @Input() event: Event;
  public invit: Invitation;

  @Input() set invitation(invit: Invitation) {
    this.invit = invit;

    if (this.requestPending && invit.status === 'accepted') {
      this.router.navigate(['/c/o/marketplace/event', invit.eventId, 'session']);
      this.requestPending = false;
    }
  }

  private requestPending: boolean = false;

  constructor(
    private router: Router,
    private service: InvitationService,
    private snackBar: MatSnackBar,
  ) { }

  accept(invitation: Invitation) {
    this.service.acceptInvitation(invitation);
  }

  decline(invitation: Invitation) {
    this.service.declineInvitation(invitation);
  }

  /** Request the owner to accept invitation (automatically accepted if event is public) */
  request(event: Event) {
    const { ownerOrgId, id, isPrivate } = event;
    this.service.request(ownerOrgId).to('attendEvent', id);
    if (isPrivate) {
      this.snackBar.open('Your request has been sent to the organizer.', 'close', { duration: 2000 });
    }
    this.requestPending = true;
  }
}
