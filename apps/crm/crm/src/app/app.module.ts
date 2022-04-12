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
import { AngularFireModule } from '@angular/fire';
import { AngularFireFunctionsModule, REGION } from '@angular/fire/functions';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirePerformanceModule } from '@angular/fire/performance';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import 'firebase/storage';

// Material
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

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
    AngularFireModule.initializeApp(firebase('crm')),
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    AngularFirePerformanceModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireAnalyticsModule,

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
    { provide: REGION, useValue: firebaseRegion },
    { provide: APP, useValue: 'crm' },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        minWidth: '50vw',
        minHeight: '50vh',
        maxWidth: '80vw',
        maxHeight: '80vh'
      }
    },
    ...emulatorConfig
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
