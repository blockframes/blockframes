import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { BehaviorSubject } from 'rxjs';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';
import { Organization } from '@blockframes/organization/+state';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { FormList } from '@blockframes/utils/form';
import { ENTER, COMMA, SEMICOLON, SPACE } from '@angular/cdk/keycodes';


@Component({
  selector: '[org] member-add',
  templateUrl: './member-add.component.html',
  styleUrls: ['./member-add.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberAddComponent {
  @Input() org: Organization;
  private _isSending = new BehaviorSubject<boolean>(false);
  public isSending$ = this._isSending.asObservable();
  public separatorKeysCodes = [ENTER, COMMA, SEMICOLON, SPACE];
  public emailForm = new FormControl('', Validators.email);
  public form = FormList.factory<string, FormControl>([], email => new FormControl(email, [Validators.required, Validators.email]));
  public error: string;


  constructor(
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
  ) { }

  add() {
    this.error = '';
    if (this.emailForm.value) {
      const emails: string[] = this.emailForm.value.split(',');
      const invalid = emails.filter(value => Validators.email({value} as AbstractControl));
      if (invalid.length) {
        this.error = `The following emails are invalid: ${invalid.join(', ')}.`;
      } else {
        for (const email of emails) {
          if (!this.form.value.includes(email)) {
            this.form.add(email.trim());
          }
        }
        this.emailForm.reset();
      }
    }
  }

  public async sendInvitations() {
    this.add();
    if (this.error) return;
    try {
      this._isSending.next(true);
      const emails = Array.from(new Set(this.form.value.map(email => email.trim().toLowerCase())));
      const invitationsExist = await this.invitationService.hasUserAnOrgOrIsAlreadyInvited(emails).toPromise<boolean>();
      if (invitationsExist) throw new Error('There is already an invitation existing for one or more of these users');
      await this.invitationService.invite(emails, this.org).to('joinOrganization');
      this.snackBar.open('Your invitation was sent', 'close', { duration: 5000 });
      this._isSending.next(false);
      this.form.reset();
    } catch (error) {
      this._isSending.next(false);
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
