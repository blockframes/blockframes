import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    private snackbar: MatSnackBar
  ) {
    this.form = new CookiesConsentForm(gdpr.cookieConsent)
  }
  
  update() {
    const settings = this.form.value;

    this.snackbar.open('Cookies updated.', 'close', { duration: 5000 });

    if (settings) {
      this.gdpr.enableIntercom(settings.intercom);
      this.gdpr.enableYandex(settings.yandex);
    }
  }
}