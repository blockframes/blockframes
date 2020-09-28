import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { BehaviorSubject } from 'rxjs';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';
import { Organization } from '@blockframes/organization/+state';
import { FormControl, Validators } from '@angular/forms';
import { FormList } from '@blockframes/utils/form';

@Component({
  selector: '[org] member-add',
  templateUrl: './member-add.component.html',
  styleUrls: ['./member-add.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberAddComponent {
  @Input() org: Organization;
  public form = FormList.factory<string, FormControl>([], email => new FormControl(email, [Validators.required, Validators.email]));
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
      await this.invitationService.invite('user', emails).from('org', this.org).to('joinOrganization', this.org.id);
      this.snackBar.open('Your invitation was sent', 'close', { duration: 2000 });
      this._isSending.next(false);
      this.form.reset();
    } catch (error) {
      this._isSending.next(false);
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
