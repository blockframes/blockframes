import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { createAddMemberFormList } from '../../forms/member.form';
import { BehaviorSubject } from 'rxjs';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';

@Component({
  selector: '[orgId] member-add',
  templateUrl: './member-add.component.html',
  styleUrls: ['./member-add.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberAddComponent {
  @Input() orgId: string;
  public form = createAddMemberFormList();
  private _isSending = new BehaviorSubject<boolean>(false);
  public isSending$ = this._isSending.asObservable();

  constructor(
    private snackBar: MatSnackBar,
    private invitationService: InvitationService
  ) { }

  public async sendInvitations() {
    try {
      this._isSending.next(true);
      if (this.form.invalid) throw new Error('Please enter valid email(s) address(es)');
      const emails = this.form.value;
      const invitationsExist = await this.invitationService.orgInvitationExists(emails);
      if (invitationsExist) throw new Error('You already send an invitation to one or more of these users');
      await this.invitationService.invite('user', emails).from('org').to('joinOrganization', this.orgId);
      this.snackBar.open('Your invitation was sent', 'close', { duration: 2000 });
      this._isSending.next(false);
      this.form.reset();
    } catch (error) {
      this._isSending.next(false);
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
