import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AngularFireFunctions } from "@angular/fire/functions";
import { AuthQuery } from "@blockframes/auth";

@Component({
  selector: 'catalog-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ContactPageComponent implements OnInit {
  public form = new FormGroup({
    subject: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required)
  });

  public center: google.maps.LatLngLiteral;
  public markerLabel: {};

  constructor(private functions: AngularFireFunctions, private query: AuthQuery) {};

  ngOnInit() {
    this.center = { lat: 48.8682044, lng: 2.3334083};
    this.markerLabel = {
      color: 'red',
      text: '59 Passage Choiseul',
    }
  }

  /**
   * Function to send email to BF admin from an user
   */
  public sendMessage(subject: string, message: string) {
    // const subject = this.form.
    const user = this.query.user;
    const callSendUserMail = this.functions.httpsCallable('sendUserContactMail');

    return callSendUserMail({userName: user.name, userMail: user.email, subject: subject, message: message}).toPromise();
  }
}
