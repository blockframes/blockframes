import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RequestDemoRole, RequestDemoInformations, createDemoRequestInformations, requestDemoRole } from '@blockframes/utils/request-demo';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'landing-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingLearnMoreComponent {
  public form = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl('', Validators.email),
    phoneNumber: new FormControl(''),
    companyName: new FormControl(''),
    role: new FormControl('')
  });

  public roles: RequestDemoRole[] = [
    'buyer',
    'seller',
    'other'
  ];

  public submitted = false;

  constructor(
    private snackBar: MatSnackBar,
    private functions: AngularFireFunctions
  ) {}

  get phoneNumber(){
    return this.form.get('phoneNumber');
  }

  /** Send a mail to the admin with user's informations. */
  private async sendDemoRequest(information: RequestDemoInformations) {
    const f = this.functions.httpsCallable('sendDemoRequest');
    return f(information).toPromise();
  }

  /** Triggers when a user click on the button from LearnMoreComponent.  */
  public sendRequest(form: FormGroup) {
    if (form.invalid) {
      this.snackBar.open('Please fill the required informations.', 'close', { duration: 2000 });
      return;
    }
    try {
      const information: RequestDemoInformations = createDemoRequestInformations(form.value);

      this.sendDemoRequest(information);
      this.snackBar.open('Your request has been sent !', 'close', { duration: 2000 });
      this.submitted = true;
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
