import { emulatorConfig } from '../environment/environment';
import { firebase, firebaseRegion, intercomId, sentryDsn } from '@env';
import { IntercomModule } from 'ng-intercom';

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';

// Components
import { AppComponent } from './app.component';

// Angular Fire
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideFunctions, getFunctions, connectFunctionsEmulator } from '@angular/fire/functions';
import { connectFirestoreEmulator, getFirestore, initializeFirestore, provideFirestore } from '@angular/fire/firestore';
import { providePerformance, getPerformance } from '@angular/fire/performance';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import 'firebase/storage';

// Material
import { MatNativeDateModule } from '@angular/material/core';

// Blockframes
import { SentryModule } from '@blockframes/utils/sentry.module';
import { ErrorLoggerModule } from '@blockframes/utils/error-logger.module';
import { CrmModule } from './crm.module';
import { APP } from '@blockframes/utils/routes/utils';

@NgModule({
  declarations: [AppComponent],
  imports: [

    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    MatNativeDateModule,  // Required for Datepicker
    OverlayModule,

    // Firebase
    provideFirebaseApp(() => initializeApp(firebase('crm'))),
    provideFirestore(() => initializeFirestore(getApp(), { experimentalAutoDetectLongPolling: true })),
    provideFunctions(() => getFunctions(getApp(), firebaseRegion)),
    providePerformance(() => getPerformance()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideAnalytics(() => getAnalytics()),

    // Sentry
    sentryDsn ? SentryModule : ErrorLoggerModule,

    // Akita
    AkitaNgRouterStoreModule,

    // Router
    CrmModule,

    // Intercom
    IntercomModule.forRoot({ appId: intercomId }),

  ],
  providers: [
    ScreenTrackingService, UserTrackingService,
    { provide: APP, useValue: 'crm' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor() {
    if (emulatorConfig.auth) {
      const auth = getAuth();
      connectAuthEmulator(auth, `http://${emulatorConfig.auth.host}:${emulatorConfig.auth.port}`);
    }

    if (emulatorConfig.firestore) {
      const db = getFirestore();
      connectFirestoreEmulator(db, emulatorConfig.firestore.host, emulatorConfig.firestore.port);
    }

    if (emulatorConfig.functions) {
      const functions = getFunctions(getApp());
      connectFunctionsEmulator(functions, emulatorConfig.functions.host, emulatorConfig.functions.port);
    }
  }
}
