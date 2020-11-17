import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AngularFireFunctions } from "@angular/fire/functions";
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { getCurrentApp } from "@blockframes/utils/apps";

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
  public markerLabel: {};

  constructor(
    private functions: AngularFireFunctions,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery
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

    const callSendUserMail = this.functions.httpsCallable('sendUserContactMail');
    this.snackBar.open('Your email has been sent !', 'close', { duration: 2000 });
    this.form.reset();
    const app = getCurrentApp(this.routerQuery);
    return callSendUserMail({ subject: userSubject, message: userMessage, app }).toPromise();
  }
}
