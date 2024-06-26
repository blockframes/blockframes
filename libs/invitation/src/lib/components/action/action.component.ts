import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/service';
import { App, Event, Invitation, InvitationStatus } from '@blockframes/model';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';
import { SnackbarLinkComponent } from '@blockframes/ui/snackbar/link/snackbar-link.component';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { InvitationService } from '../../service';
import { APP } from '@blockframes/utils/routes/utils';

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
  public acceptInvitationStr = $localize`Accept Invitation`;
  public declineInvitationStr = $localize`Decline Invitation`;

  /** @dev i18n is only on waterfall app for now #9699 */
  public bfi18n = this.app === 'waterfall';

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
    @Inject(APP) private app: App
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
    await this.service.acceptOrDeclineInvitationAsAnonymous({ invitationId, email: creds.email, status });
    this.statusChanged.emit(status);
  }

  /** Request the owner to accept invitation (automatically accepted if event is public) */
  async request(event: Event) {
    try {
      const { ownerOrgId, id, accessibility } = event;
      await this.service.request(ownerOrgId).to('attendEvent', id);
      if (accessibility !== 'public') {
        this.snackBar.open('Request sent', 'close', { duration: 4000 });
      } else {
        this.snackBar.openFromComponent(SnackbarLinkComponent, {
          data: {
            message: 'Screening added to your Calendar.',
            link: ['/event/', event.id, 'r', 'i'],
            linkName: 'SEE DETAILS'
          },
          duration: 6000
        });
      }
      this.requestPending = true;
    } catch (_) {
      this.snackBar.openFromComponent(SnackbarErrorComponent, { data: 'There was a problem sending your request...', duration: 5000 });
    }
  }
}