import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Movie, Statement, Waterfall } from '@blockframes/model';
import { FormControl, Validators } from '@angular/forms';
import { COMMA, ENTER, SEMICOLON, SPACE } from '@angular/cdk/keycodes';
import { FormList } from '@blockframes/utils/form';

interface StatementShareData {
  statement: Statement & { number: number };
  waterfall: Waterfall;
  movie: Movie;
  onConfirm: (emails: string[]) => void
}

@Component({
  selector: 'waterfall-statement-share',
  templateUrl: './statement-share.component.html',
  styleUrls: ['./statement-share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementShareComponent {

  public separatorKeysCodes = [ENTER, COMMA, SEMICOLON, SPACE];
  public emailForm = new FormControl('', Validators.email);
  public form = FormList.factory<string, FormControl>([], email => new FormControl(email, [Validators.required, Validators.email]));
  public error: string;


  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: StatementShareData,
    public dialogRef: MatDialogRef<StatementShareComponent>
  ) { }

  add() {
    this.error = undefined;
    if (this.emailForm.value) {
      const emails: string[] = this.emailForm.value.split(',');
      const invalid = emails.filter(value => Validators.email({ value } as FormControl));
      if (invalid.length) {
        this.error = $localize`The following emails are invalid: ${invalid.join(', ')}.`;
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

  public confirm() {
    this.add();
    if (this.error) return;
    const emails = Array.from(new Set(this.form.value.map(email => email.trim().toLowerCase())));
    this.data.onConfirm(emails);
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
