import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { createEmailRequest } from '@blockframes/utils/emails/utils';
import { TestEmailForm } from '@blockframes/admin/crm/forms/test-email.form';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SendgridService } from '@blockframes/utils/emails/sendgrid.service'
import { sendgridEmailsFrom } from '@blockframes/utils/apps';
import { AuthQuery } from '@blockframes/auth/+state';

@Component({
  selector: 'crm-mails',
  templateUrl: './mails.component.html',
  styleUrls: ['./mails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailsComponent implements OnInit {
  public form: TestEmailForm;
  public loading = false;
  public sendgridEmailsFrom = sendgridEmailsFrom;

  constructor(
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    private sendgrid: SendgridService,
    private authQuery: AuthQuery,
  ) {
  }

  ngOnInit() {
    this.form = new TestEmailForm();
    this.form.get('from').setValue(sendgridEmailsFrom.default);
    this.form.get('to').setValue(this.authQuery.user.email);
  }

  async sendTestEmail() {
    if (this.form.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    this.loading = true;
    const emailParameters = {
      request: createEmailRequest(this.form.value),
      from: { email: this.form.get('from').value }
    }
    const output = await this.sendgrid.sendAsAdmin(emailParameters);

    if (output.result === 'OK') {
      this.snackBar.open(`Mail successfully sent to ${emailParameters.request.to}`, 'close', { duration: 5000 });
    } else {
      this.snackBar.open('There was an error while sending email..', 'close', { duration: 5000 })
    }
    this.loading = false;
    this.cdRef.markForCheck();
  }
}
