import { Injectable } from "@angular/core";
import { CookiesConsent } from "../cookie-form/cookie.form";
import { IntercomService } from '@blockframes/utils/intercom/intercom.service';
import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';
import { getCurrentApp } from "@blockframes/utils/apps";
import { RouterQuery } from "@datorama/akita-ng-router-store";

@Injectable({ providedIn: 'root' })
export class GDPRService {

  constructor(
    private intercom: IntercomService,
    private yandex: YandexMetricaService,
    private routerQuery: RouterQuery
  ) {}

  get cookieConsent(): CookiesConsent {
    return JSON.parse(localStorage.getItem('gdpr')) ?? {};
  }

  enable(service: 'intercom' | 'yandex', enabled: boolean) {
    const cookieConsent = this.cookieConsent;
    cookieConsent[service] = enabled;
    localStorage.setItem('gdpr', JSON.stringify(cookieConsent));
  }

  enableIntercom(enable: boolean) {
    this.enable('intercom', enable);
    enable ? this.intercom.enable() : this.intercom.disable();
  }

  enableYandex(enable: boolean) {
    this.enable('yandex', enable);
    const app = getCurrentApp(this.routerQuery);
    if (enable) this.yandex.insertMetrika(app);
  }
}
