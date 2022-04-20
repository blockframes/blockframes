import { FormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity } from '@blockframes/utils/form/forms/entity.form';

export interface CookiesConsent {
  intercom: boolean;
  yandex: boolean;
  hotjar: boolean;
}

function createCookiesConsent(params?: Partial<CookiesConsent>): CookiesConsent {
  return {
    intercom: true,
    yandex: true,
    hotjar: true,
    ...params,
  }
}

function createCookiesConsentControls(entity: Partial<CookiesConsent>): EntityControl<CookiesConsent> {
  const cookies = createCookiesConsent(entity);
  return {
    intercom: new FormControl(cookies.intercom, Validators.required),
    yandex: new FormControl(cookies.yandex, Validators.required),
    hotjar: new FormControl(cookies.hotjar, Validators.required)
  }
}

type CookiesConsentControl = ReturnType<typeof createCookiesConsentControls>;

export class CookiesConsentForm extends FormEntity<CookiesConsentControl> {
  constructor(data?: CookiesConsent) {
    super(createCookiesConsentControls(data))
  }
}
