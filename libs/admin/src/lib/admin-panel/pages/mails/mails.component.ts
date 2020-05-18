import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { createEmailRequest, EmailRequest } from '@blockframes/utils/emails';
import { TestEmailForm } from '../../forms/test-email.form';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ErrorResultResponse } from '@blockframes/utils/utils';

@Component({
  selector: 'admin-mails',
  templateUrl: './mails.component.html',
  styleUrls: ['./mails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailsComponent implements OnInit {
  public form: TestEmailForm;
  public loading = false;

  constructor(
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    private functions: AngularFireFunctions
  ) {
  }

  ngOnInit() {
    this.form = new TestEmailForm();
  }

  async sendTestEmail() {
    if (this.form.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    this.loading = true;
    const request = createEmailRequest(this.form.value);
    const output = await this.sendTestMail(request);

    if (output.result === 'OK') {
      this.snackBar.open(`Mail successfully sent to ${request.to}`, 'close', { duration: 5000 });
    } else {
      this.snackBar.open('There was an error while sending email..', 'close', { duration: 5000 })
    }
    this.loading = false;
    this.cdRef.markForCheck();
  }

  private async sendTestMail(request: EmailRequest, from? : string ): Promise<ErrorResultResponse> {
    const f = this.functions.httpsCallable('onSendTestMail');
    return f({ request, from }).toPromise();
  }
}
