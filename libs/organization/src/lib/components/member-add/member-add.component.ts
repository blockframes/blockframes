import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationQuery } from '../../+state';
import { InvitationService } from '@blockframes/notification';
import { createAddMemberFormList } from '../../forms/member.form';

@Component({
  selector: 'member-add',
  templateUrl: './member-add.component.html',
  styleUrls: ['./member-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberAddComponent {
  public form = createAddMemberFormList();
  public isSending = false;

  constructor(
    private snackBar: MatSnackBar,
    private organizationQuery: OrganizationQuery,
    private invitationService: InvitationService
  ) {}

  public async sendInvitations() {
    this.isSending = true;
    try {
      if (this.form.invalid) throw new Error('Please enter valid email(s) address(es)');
      const userEmails = this.form.value;
      const organizationId = this.organizationQuery.getActiveId();
      await this.invitationService.sendInvitationsToUsers(userEmails, organizationId);
      this.snackBar.open('Your invitation was sent', 'close', { duration: 2000 });
      this.form.reset();
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
    this.isSending = false;
  }
}
