
import { emulatorConfig } from '../environment/environment';
import { firebase, firebaseRegion } from '@env';
import { FormFactoryModule } from 'ng-form-factory';

// NgFire
import { FIREBASE_CONFIG, FIRESTORE_SETTINGS, REGION_OR_DOMAIN } from 'ngfire';
import { Auth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { connectFunctionsEmulator, Functions } from 'firebase/functions';

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';

// Components
import { AppComponent } from './app.component';

// Blockframes
import { CmsModule } from './cms.module';
import { APP } from '@blockframes/utils/routes/utils';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CmsModule,
    BrowserModule,
    BrowserAnimationsModule,
    OverlayModule,
    HttpClientModule,

    FormFactoryModule,
  ],
  providers: [
    { provide: APP, useValue: 'cms' },
    {
      provide: FIREBASE_CONFIG, useValue: {
        options: firebase('cms'),
        // TODO #8280 move on xxx-env.ts ?
        firestore: (firestore: Firestore) => {
          if (emulatorConfig.firestore) {
            connectFirestoreEmulator(firestore, emulatorConfig.firestore.host, emulatorConfig.firestore.port);
          }
        },
        auth: (auth: Auth) => {
          if (emulatorConfig.auth) {
            connectAuthEmulator(auth, `http://${emulatorConfig.auth.host}:${emulatorConfig.auth.port}`, { disableWarnings: true });
          }
        },
        functions: (functions: Functions) => {
          if (emulatorConfig.functions) {
            connectFunctionsEmulator(functions, emulatorConfig.functions.host, emulatorConfig.functions.port);
          }
        }
      }
    },
    { provide: FIRESTORE_SETTINGS, useValue: { ignoreUndefinedProperties: true, experimentalAutoDetectLongPolling: true } },
    { provide: REGION_OR_DOMAIN, useValue: firebaseRegion }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
