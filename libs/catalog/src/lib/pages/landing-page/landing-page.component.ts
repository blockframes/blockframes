import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'catalog-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLandingPageComponent {
  constructor(
    private snackBar: MatSnackBar,
    private functions: AngularFireFunctions
  ){}

  /** Send a mail to the admin with user's informations. */
  private async sendDemoRequest(firstName: string, lastName: string, companyName: string, role: string) {
    const f = this.functions.httpsCallable('sendDemoRequest');
    return f({ firstName, lastName, companyName, role }).toPromise();
  }

  /** Triggers when a user click on the button from LearnMoreComponent.  */
  public sendRequest(form: FormGroup) {
    if (form.invalid) {
      this.snackBar.open('Please fill the required informations.', 'close', { duration: 2000 });
      return;
    }
    try {
      const { firstName, lastName, companyName, role } = form.value

      this.sendDemoRequest(firstName, lastName, companyName, role);
      this.snackBar.open('Your request has been sent !', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
