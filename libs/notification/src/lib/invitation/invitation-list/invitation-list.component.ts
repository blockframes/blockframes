import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationService, InvitationStore, InvitationQuery, Invitation } from '../+state';
import { Subscription } from 'rxjs';
import { AuthQuery } from '@blockframes/auth';
import { DateGroup } from '@blockframes/utils/helpers';
import { InvitationType, InvitationStatus } from '@blockframes/invitation/types';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent implements OnInit, OnDestroy {
  @Input() invitationsByDate: DateGroup<Invitation[]>;

  private sub: Subscription;

  constructor(
    private store: InvitationStore,
    private query: InvitationQuery,
    private service: InvitationService,
    private snackbar: MatSnackBar,
    private authQuery: AuthQuery
  ) {}

  ngOnInit() {
    const storeName = this.store.storeName;
    const queryFn = ref =>
      ref.where('organization.id', '==', this.authQuery.orgId).where('status', '==', 'pending');
    if (this.authQuery.orgId) {
      this.sub = this.service.syncCollection(queryFn, { storeName }).subscribe();
    }
  }

  public getInformation(invitation: Invitation) {
    return this.query.createInvitationInformation(invitation);
  }

  public acceptInvitation(invitation: Invitation) {
    try {
      this.service.acceptInvitation(invitation);
      this.snackbar.open('You accepted the invitation!', 'close', { duration: 5000 });
    } catch (error) {
      this.snackbar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public declineInvitation(invitation: Invitation) {
    try {
      this.service.declineInvitation(invitation);
      this.snackbar.open('You declined the invitation.', 'close', { duration: 5000 });
    } catch (error) {
      this.snackbar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public displayInvitationButtons(invitation: Invitation): boolean {
    return (
      invitation.type === InvitationType.fromUserToOrganization &&
      invitation.status === InvitationStatus.pending
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe(); // TODO: Leads to an error and an empty page when no invitations on /c/organization/home => ISSUE#1337
  }
}
