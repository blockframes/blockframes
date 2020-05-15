import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '@blockframes/admin/admin/admin.service.';
import { createEmailRequest } from '@blockframes/utils/emails';
import { TestEmailForm } from '../../forms/test-email.form';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
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
    const output = await this.adminService.sendTestMail(request);

    if (output.result === 'OK') {
      this.snackBar.open(`Mail successfully sent to ${request.to}`, 'close', { duration: 5000 });
    } else {
      this.snackBar.open('There was an error while sending email..', 'close', { duration: 5000 })
    }
    this.loading = false;
    this.cdRef.markForCheck();
  }
}
