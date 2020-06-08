import { FormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity } from '@blockframes/utils/form/forms/entity.form';

interface CookiesConsent {
  cascade8: boolean,
  google: boolean,
  intercom: boolean,
  yandex: boolean,
}

function createCookiesConsent(params?: Partial<CookiesConsent>): CookiesConsent {
  return {
    cascade8: true,
    google: true,
    intercom: true,
    yandex: true,
  }
}

function createCookiesConsentControls(entity: Partial<CookiesConsent>): EntityControl<CookiesConsent> {
  const cookies = createCookiesConsent(entity);
  return {
    cascade8: new FormControl(cookies.cascade8, Validators.required),
    google: new FormControl(cookies.google, Validators.required),
    intercom: new FormControl(cookies.intercom, Validators.required),
    yandex: new FormControl(cookies.yandex, Validators.required),
  }
}

type CookiesConsentControl = ReturnType<typeof createCookiesConsentControls>;

export class CookiesConsentForm extends FormEntity<CookiesConsentControl> {
  constructor(data?: CookiesConsent) {
    super(createCookiesConsentControls(data))
  }
}
