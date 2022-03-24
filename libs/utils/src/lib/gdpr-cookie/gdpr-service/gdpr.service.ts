import { Inject, Injectable } from "@angular/core";
import { CookiesConsent } from "../cookie-form/cookie.form";
import { IntercomService } from '@blockframes/utils/intercom/intercom.service';
import { User } from "@blockframes/model";
// #7936 this may be reactivated later
// import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';
import { App } from "@blockframes/utils/apps";
import { APP } from '@blockframes/utils/routes/utils';
import { HotjarService } from '@blockframes/utils/hotjar/hotjar.service';

@Injectable({ providedIn: 'root' })
export class GDPRService {

  constructor(
    private intercom: IntercomService,
    // private yandex: YandexMetricaService,
    private hotjar: HotjarService,
    @Inject(APP) private app: App
  ) { }

  get cookieConsent(): CookiesConsent {
    return JSON.parse(localStorage.getItem('gdpr')) ?? {};
  }

  enable(service: 'intercom' | 'yandex' | 'hotjar', enabled: boolean) {
    const cookieConsent = this.cookieConsent;
    cookieConsent[service] = enabled;
    localStorage.setItem('gdpr', JSON.stringify(cookieConsent));
  }

  enableIntercom(user: User, enable: boolean) {
    this.enable('intercom', enable);
    enable ? this.intercom.enable(user) : this.intercom.disable();
  }

  enableHotjar(enable: boolean) {
    this.enable('hotjar', enable);
    if (enable) this.hotjar.insertHotjar(this.app);
  }

  /*
  #7936 this may be reactivated later
  enableYandex(enable: boolean) {
    this.enable('yandex', enable);
    if (enable) this.yandex.insertMetrika(this.app);
  } */
}
