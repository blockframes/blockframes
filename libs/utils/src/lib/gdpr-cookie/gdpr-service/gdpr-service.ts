import { coerceBooleanProperty } from "@angular/cdk/coercion";

export class GDPRService {

  constructor(
    private storageConsentKey: string,
  ) { }

  private assertKeyExists() {
    const consent = localStorage.getItem(this.storageConsentKey);

    // if the key doesn't exists we set it to true
    if (consent === null || consent === undefined) {
      localStorage.setItem(this.storageConsentKey, `${true}`);
    }
  }

  get gdprIsEnabled() {
    this.assertKeyExists();
    return coerceBooleanProperty(localStorage.getItem(this.storageConsentKey));
  }

  gdprEnable() {
    localStorage.setItem(this.storageConsentKey, `${true}`);
  }

  gdprDisable() {
    localStorage.setItem(this.storageConsentKey, `${false}`);
  }

}
