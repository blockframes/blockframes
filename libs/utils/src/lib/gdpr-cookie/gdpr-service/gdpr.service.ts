import { Injectable } from "@angular/core";
import { CookiesConsent } from "../cookie-form/cookie.form";
import { IntercomService } from '@blockframes/utils/intercom/intercom.service';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';

@Injectable({ providedIn: 'root' })
export class GDPRService {

  constructor(
    private analytics: FireAnalytics,
    private intercom: IntercomService,
    private yandex: YandexMetricaService,
  ) {}

  get cookieConsent(): CookiesConsent {
    return JSON.parse(localStorage.getItem('gdpr')) ?? {};
  }

  enable(service: 'googleAnalytics' | 'intercom' | 'yandex', enabled: boolean) {
    const cookieConsent = this.cookieConsent;
    cookieConsent[service] = enabled;
    localStorage.setItem('gdpr', JSON.stringify(cookieConsent));
  }

  enableIntercom(enable: boolean) {
    this.enable('intercom', enable);
    enable ? this.intercom.enable() : this.intercom.disable();
  }

  enableAnalytics(enable: boolean) {
    this.enable('googleAnalytics', enable);
    this.analytics.analytics.setAnalyticsCollectionEnabled(enable);
  }

  enableYandex(enable: boolean) {
    this.enable('yandex', enable);
    if (enable) this.yandex.insertMetrika();
  }
}
