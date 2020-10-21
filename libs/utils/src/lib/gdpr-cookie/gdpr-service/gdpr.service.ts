import { Injectable } from "@angular/core";
import { CookiesConsent } from "../cookie-form/cookie.form";

@Injectable({ providedIn: 'root' })
export class GDPRService {

  get cookieConsent(): CookiesConsent {
    return JSON.parse(localStorage.getItem('gdpr')) ?? {};
  }

  enable(service: 'intercom' | 'yandex', enabled: boolean) {
    const cookieConsent = this.cookieConsent;
    cookieConsent[service] = enabled;
    localStorage.setItem('gdpr', JSON.stringify(cookieConsent));
  }
}
