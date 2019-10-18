import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { persistState, enableAkitaProdMode, akitaDevtools } from '@datorama/akita';
import { LocalStorageVault } from 'libs/ethers/src/lib/vault/vault';

// ethereum private keys storage
persistState({
  include: ['key'],
  deserialize: (data) => {
    const state = JSON.parse(data);
    if (!!state.key && !!state.key.active) delete state.key.active;
    return state;
  },
  storage: LocalStorageVault // could use different type of vault as long as they implement `PersistStateStorage`
});

// TODO uncomment this one day
// persistState({
//   exclude: ['router', 'key'],
//   key: 'delivery'
// });

if (environment.production) {
  enableProdMode();
  enableAkitaProdMode();
} else {
  akitaDevtools();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
