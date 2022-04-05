import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/+state';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/snackbar-error.component';
import { CookiesConsentForm } from '@blockframes/utils/gdpr-cookie/cookie-form/cookie.form';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';

@Component({
  selector: 'user-profile-cookie',
  templateUrl: 'profile-cookie.component.html',
  styleUrls: ['profile-cookie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProfileCookieComponent {

  public form: CookiesConsentForm;
  public hasAccepted: boolean;

  constructor(
    private gdpr: GDPRService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.form = new CookiesConsentForm(gdpr.cookieConsent)
  }

  update() {
    const settings = this.form.value;

    if (settings) {
      this.gdpr.enableIntercom(this.authService.profile, settings.intercom);
      // this.gdpr.enableYandex(settings.yandex); #7936 this may be reactivated later
      this.gdpr.enableHotjar(settings.hotjar);
      this.snackBar.open('Cookie Preferences updated.', 'close', { duration: 4000 });
    } else {
      this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 5000 });
    }
  }
}