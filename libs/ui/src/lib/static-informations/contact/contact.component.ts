import { ChangeDetectionStrategy, Component, Inject, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Functions, httpsCallable } from "@angular/fire/functions";
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { App } from "@blockframes/utils/apps";
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'bf-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  public form = new FormGroup({
    subject: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required)
  });
  public center: google.maps.LatLngLiteral;
  public markerLabel: Record<string, string>;

  constructor(
    private functions: Functions,
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
      const callSendUserMail = httpsCallable(this.functions, 'sendUserContactMail');
      this.snackBar.open('Message sent.', 'close', { duration: 2000 });
      this.form.reset();
      return callSendUserMail({ subject: userSubject, message: userMessage, app: this.app });
    } else {
      this.snackBar.open('Subject and message are mandatory.', 'close', { duration: 2000 });
    }
  }
}
