import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';
import { CallableFunctions } from 'ngfire';

@Component({
  selector: 'bf-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  public form = new UntypedFormGroup({
    subject: new UntypedFormControl('', Validators.required),
    message: new UntypedFormControl('', Validators.required)
  });
  public center: google.maps.LatLngLiteral;
  public markerLabel: Record<string, string>;

  constructor(
    private functions: CallableFunctions,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService,
    @Inject(APP) private app: App
  ) {
    this.dynTitle.setPageTitle('Contact us')
  }

  ngOnInit() {
    this.center = { lat: 48.8682044, lng: 2.3334083 };
    this.markerLabel = {
      color: 'red',
      text: '59 Passage Choiseul',
    }
  }

  /**
   * Function to send email to BF admin from an user
   */
  public sendMessage() {
    const userSubject = this.form.get('subject').value;
    const userMessage = this.form.get('message').value;

    if (this.form.valid) {
      this.snackBar.open('Message sent.', 'close', { duration: 2000 });
      this.form.reset();
      return this.functions.call('sendUserContactMail', { subject: userSubject, message: userMessage, app: this.app });
    } else {
      this.snackBar.open('Subject and message are mandatory.', 'close', { duration: 2000 });
    }
  }
}
