import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { production } from '@env';
import { loadTranslations } from '@angular/localize';
import { SupportedLanguages, preferredLanguage, supportedLanguages } from '@blockframes/model';
import { registerLocaleData } from '@angular/common';

if (production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
});

initLanguage(preferredLanguage());

/**
 * @dev run this command to generate the translation files:
 * npx nx run waterfall:extract-i18n --format=json --output-path=./apps/waterfall/waterfall/src/assets
 * 
 * @dev created from https://stackblitz.com/~/github.com/TheSlimvReal/angular-runtime-translations
 * Ressources:
 * https://angular.io/api/localize/loadTranslations#description
 * https://angular.io/cli/extract-i18n
 * @param locale 
 * @returns 
 */
async function initLanguage(locale: SupportedLanguages): Promise<void> {
  if (!Object.keys(supportedLanguages).includes(locale)) locale = 'en';

  const resp = await fetch('/assets/messages.' + locale + '.json');
  const text = await resp.text();
  const { translations } = JSON.parse(text);

  loadTranslations(translations);
  $localize.locale = locale;

  // Load required locale module
  switch (locale) {
    case 'fr': {
      const localeModule = await import('../../../../node_modules/@angular/common/locales/fr');
      registerLocaleData(localeModule.default);
      break;
    }
    case 'en': {
      // Default locale is already loaded
      break;
    }
    default:
      console.warn('No locale module loaded');
      break;
  }

}
