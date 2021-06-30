import { ChangeDetectionStrategy, Component, ContentChild, Directive, HostBinding, Input, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { createDemoRequestInformations, RequestDemoInformations } from '@blockframes/utils/request-demo';
import { MatSnackBar } from '@angular/material/snack-bar'
import { getCurrentApp, getAppName } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { AngularFireFunctions } from '@angular/fire/functions';
import { RequestDemoRole } from '@blockframes/utils/request-demo';
import { testEmail } from "@blockframes/e2e/utils";
import { ThemeService } from '@blockframes/ui/theme';

@Directive({
  selector: 'landing-header, [landingHeader]',
})
export class LandingHeaderDirective {
  @HostBinding('class') theme = 'dark-contrast-theme'
}

@Directive({selector: 'landing-content, [landingContent]'})
export class LandingContentDirective { }

@Directive({selector: 'landing-contact, [landingContact]'})
export class LandingContactDirective { }

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class LandingShellComponent {
  public submitted = false;
  public appName = getAppName(getCurrentApp(this.routerQuery));
  public buttonText = 'Send Request';

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

  @ContentChild(LandingContactDirective) landingContactDirective: LandingContactDirective
  @ContentChild(LandingFooterComponent) landingFooterComponent: LandingFooterComponent

  constructor(
    private snackBar: MatSnackBar,
    private routerQuery: RouterQuery,
    private functions: AngularFireFunctions,
    theme: ThemeService)
  {
    theme.initTheme('light');
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
      this.buttonText = 'Sending Request...';
      const currentApp = getCurrentApp(this.routerQuery);
      let information: RequestDemoInformations = createDemoRequestInformations({ app: currentApp, ...form.value });
      // @ts-ignore
      if (window.Cypress) {
        information.test = true;
        information.testEmailTo = testEmail;
      }
      this.sendDemoRequest(information);
      this.buttonText = 'Request Sent';
      this.snackBar.open('Your request has been sent.', 'close', { duration: 2000 });
      this.submitted = true;
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
