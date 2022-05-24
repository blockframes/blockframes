
import { emulatorConfig } from '../environment/environment';
import { firebase, firebaseRegion } from '@env';
import { FormFactoryModule } from 'ng-form-factory';

// NgFire
import { FIREBASE_CONFIG, FIRESTORE_SETTINGS, REGION_OR_DOMAIN } from 'ngfire';

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
import { EMULATORS_CONFIG, setupEmulators } from '@blockframes/utils/emulator-front-setup';

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
    { provide: EMULATORS_CONFIG, useValue: emulatorConfig },
    {
      provide: FIREBASE_CONFIG, useValue: {
        options: firebase('cms'),
        ...setupEmulators(emulatorConfig)
      }
    },
    { provide: FIRESTORE_SETTINGS, useValue: { ignoreUndefinedProperties: true, experimentalAutoDetectLongPolling: true } },
    { provide: REGION_OR_DOMAIN, useValue: firebaseRegion }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
