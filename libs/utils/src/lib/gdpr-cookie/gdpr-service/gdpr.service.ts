import { Injectable } from "@angular/core";
import { CookiesConsent } from "../cookie-form/cookie.form";
import { IntercomService } from '@blockframes/utils/intercom/intercom.service';
import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';
import { User } from "@blockframes/user/types";
import { AppGuard } from '@blockframes/utils/routes/app.guard';

@Injectable({ providedIn: 'root' })
export class GDPRService {

  constructor(
    private intercom: IntercomService,
    private yandex: YandexMetricaService,
    private appGuard: AppGuard,
  ) { }

  get cookieConsent(): CookiesConsent {
    return JSON.parse(localStorage.getItem('gdpr')) ?? {};
  }

  enable(service: 'intercom' | 'yandex', enabled: boolean) {
    const cookieConsent = this.cookieConsent;
    cookieConsent[service] = enabled;
    localStorage.setItem('gdpr', JSON.stringify(cookieConsent));
  }

  enableIntercom(user: User, enable: boolean) {
    this.enable('intercom', enable);
    enable ? this.intercom.enable(user) : this.intercom.disable();
  }

  enableYandex(enable: boolean) {
    this.enable('yandex', enable);
    const app = this.appGuard.currentApp;
    if (enable) this.yandex.insertMetrika(app);
  }
}
