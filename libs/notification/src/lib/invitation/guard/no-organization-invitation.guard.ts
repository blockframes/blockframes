import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InvitationService } from '../+state/invitation.service';
import { Invitation } from '@blockframes/invitation/types';
import { AuthQuery } from '@blockframes/auth';

@Injectable({ providedIn: 'root' })
export class NoOrganizationInvitationGuard {
  private subscription: Subscription;

  constructor(private invitationService: InvitationService, private router: Router, private authQuery: AuthQuery) {}

  canActivate() {
    return new Promise(res => {
      this.subscription = this.invitationService.syncUserInvitations().subscribe({
        next: (invitations: Invitation[]) => {
          if (!invitations) {
            return res(false);
          }
          if (invitations.find(invitation => invitation.status === 'pending')) {
            return res(this.router.parseUrl('layout/organization/home'));
          }
          return res(true);
        }
      });
    });
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}
