import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AngularFireFunctions } from "@angular/fire/functions";
import { AuthQuery } from "@blockframes/auth";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

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

  constructor(
    private functions: AngularFireFunctions,
    private query: AuthQuery,
    private snackBar: MatSnackBar,
    private title: Title
  ) {
    this.title.setTitle('Contact us - Archipel Content')
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
    const user = this.query.user;
    const userDisplayName = `${user.name} ${user.surname}`;

    const callSendUserMail = this.functions.httpsCallable('sendUserContactMail');
    this.snackBar.open('Your email has been sent !', 'close', { duration: 2000 });
    this.form.reset();

    return callSendUserMail({ userName: userDisplayName, userMail: user.email, subject: userSubject, message: userMessage }).toPromise();
  }
}
