import { ChangeDetectionStrategy, Component } from '@angular/core';
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

  constructor(private gdpr: GDPRService) {
    this.form = new CookiesConsentForm(gdpr.cookieConsent)
  }
  
  update() {
    const settings = this.form.value;

    if (settings) {
      this.gdpr.enableAnalytics(settings.googleAnalytics);
      this.gdpr.enableIntercom(settings.intercom);
      this.gdpr.enableYandex(settings.yandex);
    }
  }
}