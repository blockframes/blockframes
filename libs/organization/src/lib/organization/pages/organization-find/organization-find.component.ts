import { algolia } from '@env';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';

@Component({
  selector: 'organization-find',
  templateUrl: './organization-find.component.html',
  styleUrls: ['./organization-find.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationFindComponent {
  private orgID: string;
  public orgIndex = algolia.indexNameOrganizations;

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private invitationService: InvitationService,
  ) { }

  public updateValue(result: any) {
    this.orgID = result.objectID;
  }

  public async requestToJoinOrganization() {
    if (this.orgID) {
      try {
        await this.invitationService.sendInvitationToOrg(this.orgID);
        this.snackBar.open('Request sent !', 'close', { duration: 2000 });
        return this.router.navigate(['c/organization/join-congratulations']);
      } catch (error) {
        this.snackBar.open(error.message, 'close', { duration: 2000 });
      }
    }
    else {
      this.snackBar.open('Please select an organization', 'close', { duration: 2000 });
    }
  }
}
