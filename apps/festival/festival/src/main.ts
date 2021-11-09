import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { production } from '@env';
import { akitaConfig, akitaDevtools, enableAkitaProdMode } from '@datorama/akita';

if (production) {
  enableProdMode();
  enableAkitaProdMode();
} else {
  akitaDevtools();
}

akitaConfig({
  resettable: true
});

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
});
