import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationQuery } from '../../+state';
import { InvitationService } from '@blockframes/notification';
import { createAddMemberFormList } from '../../forms/member.form';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'member-add',
  templateUrl: './member-add.component.html',
  styleUrls: ['./member-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberAddComponent {
  public form = createAddMemberFormList();
  private _isSending = new BehaviorSubject<boolean>(false);
  public isSending$ = this._isSending.asObservable();

  constructor(
    private snackBar: MatSnackBar,
    private organizationQuery: OrganizationQuery,
    private invitationService: InvitationService
  ) {}

  public async sendInvitations() {
    this._isSending.next(true);
    try {
      if (this.form.invalid) throw new Error('Please enter valid email(s) address(es)');
      const userEmails = this.form.value;
      const invitationsExist = await this.invitationService.orgInvitationExists(userEmails);
      if (invitationsExist) throw new Error('You already send an invitation to one or more of these users');
      const organizationId = this.organizationQuery.getActiveId();
      await this.invitationService.sendInvitationsToUsers(userEmails, organizationId);
      this.snackBar.open('Your invitation was sent', 'close', { duration: 2000 });
      this.form.reset();
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
    this._isSending.next(false);
  }
}
