import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { akitaConfig, akitaDevtools, enableAkitaProdMode, persistState } from '@datorama/akita';

if (environment.production) {
  enableProdMode();
  enableAkitaProdMode();
} else {
  akitaDevtools();
}

akitaConfig({
  resettable: true
});

persistState({ include: ['marketplace'] });

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
