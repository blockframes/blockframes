import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { createDemoRequestInformations, RequestDemoInformations } from '@blockframes/utils/request-demo';
import { MatSnackBar } from '@angular/material/snack-bar'
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { AngularFireFunctions } from '@angular/fire/functions';
import { RequestDemoRole } from '@blockframes/utils/request-demo';

@Component({
  selector: 'landing-header',
  template: '<ng-content></ng-content>',
  host: {
    class: 'dark-contrast-theme'
  },
  styles: [`:host {
  display: block;
  padding: calc(var(--toolbarHeight) + 100px) 60px 100px;;
  background-size: cover;
  width: 100%
}`]
})
export class LandingHeaderComponent { }

@Component({
  selector: 'landing-content',
  template: `<ng-content></ng-content>`,
  styles: [`:host {
    display: block;
    margin: 48px 60px;
}`]
})
export class LandingContentComponent { }

@Component({
  selector: 'landing-contact',
  template: `<ng-content></ng-content>`,
  styles: [`:host {
    display: block;
  }`]
})
export class LandingContactComponent { }

@Component({
  selector: 'landing-footer',
  template: `<ng-content></ng-content>`,
  styles: [`:host {
    display: flex;
    flex-direction: column;
    align-items: center;
  }`]
})
export class LandingFooterComponent { }

@Component({
  selector: 'landing-shell-page',
  templateUrl: 'shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingShellComponent {
  public submitted = false;

  @Input() roles: RequestDemoRole[] = [
    'buyer',
    'seller',
    'other'
  ];

  public form = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl('', Validators.email),
    phoneNumber: new FormControl(''),
    companyName: new FormControl(''),
    role: new FormControl('')
  });

  @ContentChild(LandingContactComponent) landingContractComponent: LandingContactComponent
  @ContentChild(LandingFooterComponent) landingFooterComponent: LandingFooterComponent

  constructor(private snackBar: MatSnackBar, private routerQuery: RouterQuery, private functions: AngularFireFunctions) { }

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
      const currentApp = getCurrentApp(this.routerQuery);
      const information: RequestDemoInformations = createDemoRequestInformations({ app: currentApp, ...form.value });

      this.sendDemoRequest(information);
      this.snackBar.open('Your request has been sent!', 'close', { duration: 2000 });
      this.submitted = true;
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
