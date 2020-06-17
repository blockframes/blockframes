import { FormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity } from '@blockframes/utils/form/forms/entity.form';

export interface CookiesConsent {
  google: boolean,
  intercom: boolean,
  yandex: boolean,
}

function createCookiesConsent(params?: Partial<CookiesConsent>): CookiesConsent {
  return {
    google: true,
    intercom: true,
    yandex: true,
    ...params,
  }
}

function createCookiesConsentControls(entity: Partial<CookiesConsent>): EntityControl<CookiesConsent> {
  const cookies = createCookiesConsent(entity);
  return {
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
