import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { Event } from '@blockframes/event/+state';
import { Invitation, InvitationStatus } from '@blockframes/model';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { InvitationService } from '../../+state';

@Component({
  selector: 'invitation-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionComponent {

  @Input() event: Event;
  public invit: Invitation;
  public accepting = false;
  public declining = false;

  @Input() set invitation(invit: Invitation) {
    this.invit = invit;

    if (this.requestPending && invit.status === 'accepted') {
      this.router.navigate(['/event', invit.eventId, 'r', 'i', 'session']);
      this.requestPending = false;
    }
  }

  @Input() @boolean small = false;
  @Input() @boolean flat = false;
  @Output() statusChanged = new EventEmitter<InvitationStatus>();

  private requestPending = false;
  user$ = this.authService.profile$;

  constructor(
    private router: Router,
    private service: InvitationService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) { }

  accept(invitation: Invitation) {
    this.accepting = true;
    if (!this.authService.profile) {
      this.acceptOrDeclineAsAnonymous(invitation.id, 'accepted');
    } else {
      this.service.acceptInvitation(invitation);
    }
  }

  decline(invitation: Invitation) {
    this.declining = true;
    if (!this.authService.profile) {
      this.acceptOrDeclineAsAnonymous(invitation.id, 'declined');
    } else {
      this.service.declineInvitation(invitation);
    }
  }

  async acceptOrDeclineAsAnonymous(invitationId: string, status: InvitationStatus) {
    const creds = this.authService.anonymousCredentials;
    await this.service.acceptOrDeclineInvitationAsAnonymous({ invitationId, email: creds.email, status }).toPromise<boolean>();
    this.statusChanged.emit(status);
  }

  /** Request the owner to accept invitation (automatically accepted if event is public) */
  request(event: Event) {
    const { ownerOrgId, id, accessibility } = event;
    this.service.request(ownerOrgId).to('attendEvent', id);
    if (accessibility !== 'public') {
      this.snackBar.open('Your request has been sent to the organizer.', 'close', { duration: 3000 });
    }
    this.requestPending = true;
  }
}
