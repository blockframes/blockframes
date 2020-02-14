import { ChangeDetectionStrategy, Component, OnInit, NgZone } from '@angular/core';
import { AuthQuery } from '@blockframes/auth';
import { InvitationService } from '@blockframes/notification/invitation/+state/invitation.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'organization-feedback',
  templateUrl: './organization-feedback.component.html',
  styleUrls: ['./organization-feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFeedbackComponent implements OnInit {
  public invitations;
  public orgName: string;

  constructor(
    private service: InvitationService,
    private authQuery: AuthQuery,
    private snackBar: MatSnackBar,
    private _ngZone: NgZone
  ) {}

  ngOnInit() {
    this.getInvitation();
  }

  async getInvitation() {
    const uid = this.authQuery.userId;
    this.invitations = await this.service.getValue(ref => ref.where('user.uid', '==', uid));
    this.orgName = this.invitations[0].organization.name
    this._ngZone.run(() => {});
  }
  
  public removeInvitation() {
    try {
      this.service.remove(this.invitations[0].id)
      this.snackBar.open('Your request to join an organization has been canceled.', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

}
