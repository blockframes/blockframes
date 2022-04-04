import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/+state';
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
    private snackbar: MatSnackBar,
    private authService: AuthService
  ) {
    this.form = new CookiesConsentForm(gdpr.cookieConsent)
  }

  update() {
    const settings = this.form.value;

    this.snackbar.open('Cookie Preferences updated.', 'close', { duration: 4000 });

    if (settings) {
      this.gdpr.enableIntercom(this.authService.profile, settings.intercom);
      // this.gdpr.enableYandex(settings.yandex); #7936 this may be reactivated later
      this.gdpr.enableHotjar(settings.hotjar);
    }
  }
}