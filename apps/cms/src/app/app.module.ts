
import { emulatorConfig } from '../environment/environment';
import { firebase, firebaseRegion } from '@env';
import { FormFactoryModule } from 'ng-form-factory';

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';

// Components
import { AppComponent } from './app.component';

// Angular Fire
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { connectFirestoreEmulator, initializeFirestore, provideFirestore } from '@angular/fire/firestore';
import { providePerformance, getPerformance } from '@angular/fire/performance';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';

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
    provideFirebaseApp(() => initializeApp(firebase('cms'))),
    provideFirestore(() => {
      const db = initializeFirestore(getApp(), { experimentalAutoDetectLongPolling: true });
      if (emulatorConfig.firestore) {
        connectFirestoreEmulator(db, emulatorConfig.firestore.host, emulatorConfig.firestore.port);
      }
      return db;
    }),
    providePerformance(() => getPerformance()),
    provideAuth(() => {
      const auth = getAuth();
      if (emulatorConfig.auth) {
        connectAuthEmulator(auth, `http://${emulatorConfig.auth.host}:${emulatorConfig.auth.port}`);
      }
      return auth;
    }),
    provideFunctions(() => {
      const functions = getFunctions(getApp(), firebaseRegion);
      if (emulatorConfig.functions) {
        connectFunctionsEmulator(functions, emulatorConfig.functions.host, emulatorConfig.functions.port);
      }
      return functions;
    }),
    provideStorage(() => getStorage()),

    FormFactoryModule,
  ],
  providers: [
    { provide: APP, useValue: 'cms' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
