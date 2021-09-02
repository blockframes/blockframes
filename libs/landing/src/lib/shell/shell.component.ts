import { ChangeDetectionStrategy, Component, ContentChild, Directive, HostBinding, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { createDemoRequestInformations, RequestDemoInformations } from '@blockframes/utils/request-demo';
import { MatSnackBar } from '@angular/material/snack-bar'
import { getCurrentApp, getAppName } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { AngularFireFunctions } from '@angular/fire/functions';
import { RequestDemoRole } from '@blockframes/utils/request-demo';
import { ThemeService } from '@blockframes/ui/theme';
import { testEmail } from "@blockframes/e2e/utils/env";

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

@Directive({selector: 'landing-detail, [landingDetail]'})
export class LandingDetailDirective { }

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
export class LandingShellComponent implements OnDestroy {
  public submitted = false;
  public appName = getAppName(getCurrentApp(this.routerQuery));
  public buttonText = 'Submit Demo Request';

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
  @ContentChild(LandingDetailDirective) landingDetailDirective: LandingDetailDirective
  @ContentChild(LandingFooterComponent) landingFooterComponent: LandingFooterComponent

  constructor(
    private snackBar: MatSnackBar,
    private routerQuery: RouterQuery,
    private functions: AngularFireFunctions,
    private theme: ThemeService
  ) {
    theme.setTheme('light')
  }

  ngOnDestroy() {
    // resetting theme to theme preference of system/browser
    this.theme.initTheme('light')
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
      const information: RequestDemoInformations = createDemoRequestInformations({ app: currentApp, ...form.value });
      if ('Cypress' in window) {
        information.test = true;
        information.testEmailTo = testEmail;
      }
      this.sendDemoRequest(information);
      this.buttonText = 'Request Sent';
      this.snackBar.open('Request sent', 'close', { duration: 2000 });
      this.submitted = true;
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
