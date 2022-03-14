import { ChangeDetectionStrategy, Component, ContentChild, Directive, HostBinding, Input, OnDestroy, ViewEncapsulation, ChangeDetectorRef, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { createDemoRequestInformations, RequestDemoInformations } from '@blockframes/utils/request-demo';
import { MatSnackBar } from '@angular/material/snack-bar'
import { Functions, httpsCallable } from '@angular/fire/functions';
import { RequestDemoRole } from '@blockframes/utils/request-demo';
import { ThemeService } from '@blockframes/ui/theme';
import { testEmail } from "@blockframes/e2e/utils/env";
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/utils/apps';

@Directive({
  selector: 'landing-header, [landingHeader]',
})
export class LandingHeaderDirective {
  @HostBinding('class') theme = 'dark-contrast-theme'
}

@Directive({ selector: 'landing-content, [landingContent]' })
export class LandingContentDirective { }

@Directive({ selector: 'landing-contact, [landingContact]' })
export class LandingContactDirective { }

@Directive({ selector: 'landing-detail, [landingDetail]' })
export class LandingDetailDirective { }

@Directive({ selector: 'landing-app-link, [landingAppLink]' })
export class LandingAppLinkDirective { }

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
  public newslettersSubmitted = false;
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
    role: new FormControl(''),
    newsletters: new FormControl(false)
  });

  public newslettersForm = new FormGroup({
    email: new FormControl('', Validators.email)
  });

  @ContentChild(LandingContactDirective) landingContactDirective: LandingContactDirective
  @ContentChild(LandingDetailDirective) landingDetailDirective: LandingDetailDirective
  @ContentChild(LandingAppLinkDirective) landingAppLinkDirective: LandingAppLinkDirective
  @ContentChild(LandingFooterComponent) landingFooterComponent: LandingFooterComponent

  constructor(
    private snackBar: MatSnackBar,
    private functions: Functions,
    private theme: ThemeService,
    private cdr: ChangeDetectorRef,
    @Inject(APP) private app: App
  ) {
    theme.setTheme('light');
  }

  scrollToTop() {
    scrollIntoView(document.getElementsByTagName("header")[0]);
  }

  ngOnDestroy() {
    // resetting theme to theme preference of system/browser
    this.theme.initTheme('light');
  }

  /** Send a mail to the admin with user's informations. */
  private async sendDemoRequest(information: RequestDemoInformations) {
    const f = httpsCallable(this.functions,'sendDemoRequest');
    return f(information);
  }

  /** Register an email to a mailchimp mailing list */
  private async registerEmailToNewsletters(email: string) {
    const f = httpsCallable(this.functions,'registerToNewsletter');
    const tags = [`landing - ${this.app}`];
    return f({ email, tags });
  }

  /** Triggers when a user click on the button from LearnMoreComponent.  */
  public async sendRequest(form: FormGroup) {
    if (form.invalid) {
      this.snackBar.open('Please fill the required informations.', 'close', { duration: 2000 });
      return;
    }
    try {
      this.buttonText = 'Sending Request...';
      const information: RequestDemoInformations = createDemoRequestInformations({ app: this.app, ...form.value });
      if ('Cypress' in window) {
        information.testEmailTo = testEmail;
      }

      await this.sendDemoRequest(information);
      if (information.newsletters) {
        await this.registerEmailToNewsletters(information.email);
        this.newslettersSubmitted = true;
      }

      this.buttonText = 'Request Sent';
      this.snackBar.open('Request sent', 'close', { duration: 2000 });
      this.submitted = true;
      this.cdr.markForCheck();
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public async subscribe(form: FormGroup) {
    if (form.invalid) {
      this.snackBar.open('Please enter a valid email address.', 'close', { duration: 2000 });
      return;
    }
    try {
      await this.registerEmailToNewsletters(form.value.email);
      this.newslettersSubmitted = true;
      this.snackBar.open('Subscribed to newsletters', 'close', { duration: 2000 });
      this.cdr.markForCheck();

    } catch (error) {
      this.snackBar.open('Please enter a valid email address.', 'close', { duration: 2000 });
    }
  }
}
