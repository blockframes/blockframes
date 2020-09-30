export class GDPRService {

  constructor(private storageConsentKey: string) { }

  gdprEnable() {
    localStorage.setItem(this.storageConsentKey, `${true}`);
  }

  gdprDisable() {
    localStorage.setItem(this.storageConsentKey, `${false}`);
  }
}
