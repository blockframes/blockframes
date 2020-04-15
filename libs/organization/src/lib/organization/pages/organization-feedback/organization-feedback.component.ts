import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationFromUserToOrganization } from '@blockframes/invitation/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'organization-feedback',
  templateUrl: './organization-feedback.component.html',
  styleUrls: ['./organization-feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFeedbackComponent implements OnInit {
  public invitations: InvitationFromUserToOrganization[];
  public orgName: Observable<string>;
  public isCanceled: boolean;

  constructor(
    private service: InvitationService,
    private authQuery: AuthQuery,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    const uid = this.authQuery.userId;
    this.invitations = await this.service.getValue(ref => ref.where('fromUser.uid', '==', uid)) as any;
  }

  public removeInvitation() {
    try {
      this.service.remove(this.invitations[0].id)
      this.snackBar.open('Your request to join an organization has been canceled.', 'close', { duration: 2000 });
      this.isCanceled = true;
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

}
