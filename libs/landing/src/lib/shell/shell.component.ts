import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Directive,
  HostBinding,
  Input,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { createDemoRequestInformations, RequestDemoInformations } from '@blockframes/utils/request-demo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestDemoRole } from '@blockframes/utils/request-demo';
import { ThemeService } from '@blockframes/ui/theme';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';
//TODO define proper way to import next line #8071
// eslint-disable-next-line @nx/enforce-module-boundaries
import { e2eSupportEmail } from '@blockframes/utils/constants';
import { CallableFunctions } from 'ngfire';

@Directive({
  selector: 'landing-header, [landingHeader]',
})
export class LandingHeaderDirective {
  @HostBinding('class') theme = 'dark-contrast-theme';
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

  @Input() roles: RequestDemoRole[] = ['buyer', 'seller', 'other'];

  public form = new UntypedFormGroup({
    firstName: new UntypedFormControl(''),
    lastName: new UntypedFormControl(''),
    email: new UntypedFormControl('', Validators.email),
    phoneNumber: new UntypedFormControl(''),
    companyName: new UntypedFormControl(''),
    role: new UntypedFormControl(''),
    newsletters: new UntypedFormControl(false)
  });

  public newslettersForm = new UntypedFormGroup({
    email: new UntypedFormControl('', Validators.email)
  });

  @ContentChild(LandingContactDirective) landingContactDirective: LandingContactDirective;
  @ContentChild(LandingDetailDirective) landingDetailDirective: LandingDetailDirective;
  @ContentChild(LandingAppLinkDirective) landingAppLinkDirective: LandingAppLinkDirective;
  @ContentChild(LandingFooterComponent) landingFooterComponent: LandingFooterComponent;

  /** Send a mail to the admin with user's informations. */
  sendDemoRequest = this.functions.prepare<RequestDemoInformations, unknown>('sendDemoRequest');

  constructor(
    private snackBar: MatSnackBar,
    private functions: CallableFunctions,
    private theme: ThemeService,
    private cdr: ChangeDetectorRef,
    @Inject(APP) private app: App
  ) {
    theme.setTheme('light');
  }

  scrollToTop() {
    scrollIntoView(document.getElementsByTagName('header')[0]);
  }

  ngOnDestroy() {
    // resetting theme to theme preference of system/browser
    this.theme.initTheme('light');
  }

  /** Register an email to a mailchimp mailing list */
  private registerEmailToNewsletters(email: string) {
    const tags = [`landing - ${this.app}`];
    return this.functions.call<{ email: string; tags: string[] }, unknown>('registerToNewsletter', { email, tags });
  }

  /** Triggers when a user click on the button from LearnMoreComponent.  */
  public async sendRequest(form: UntypedFormGroup) {
    if (form.invalid) {
      this.snackBar.open('Please fill the required informations.', 'close', { duration: 2000 });
      return;
    }
    try {
      this.buttonText = 'Sending Request...';
      const information: RequestDemoInformations = createDemoRequestInformations({ app: this.app, ...form.value });
      if ('Cypress' in window) {
        information.testEmailTo = e2eSupportEmail;
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

  public async subscribe(form: UntypedFormGroup) {
    if (form.invalid) {
      this.snackBar.open('Please enter a valid email address.', 'close', { duration: 2000 });
      return;
    }
    try {
      await this.registerEmailToNewsletters(form.value.email);
      this.newslettersSubmitted = true;
      this.snackBar.open('Subscribed to newsletters', 'close', { duration: 2000 });
      this.cdr.markForCheck();
    } catch (err) {
      this.snackBar.open('You are already subscribed to our newsletter.', 'close', { duration: 5000 });
    }
  }
}
