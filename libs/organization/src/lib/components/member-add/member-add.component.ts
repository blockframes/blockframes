import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationQuery } from '../../+state';
import { InvitationService } from '@blockframes/notification';

@Component({
  selector: 'member-add',
  templateUrl: './member-add.component.html',
  styleUrls: ['./member-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberAddComponent {
  /** The control to send an invitation with the given email */
  public emailControl = new FormControl('', Validators.email);

  constructor(
    private snackBar: MatSnackBar,
    private organizationQuery: OrganizationQuery,
    private invitationService: InvitationService
  ) {}

  public async sendInvitation() {
    try {
      if (this.emailControl.invalid) throw new Error('Please enter a valid email address');
      const userEmail = this.emailControl.value;
      const organizationId = this.organizationQuery.id;
      await this.invitationService.sendInvitationToUser(userEmail, organizationId);
      this.snackBar.open('Your invitation was sent', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
