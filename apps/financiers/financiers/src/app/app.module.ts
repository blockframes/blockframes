import { filter } from 'rxjs/operators';
import { emulatorConfig } from '../environment/environment';
import { firebase, production, intercomId, firebaseRegion, sentryDsn } from '@env';
import { IntercomModule } from 'ng-intercom';

// NgFire
import { FIREBASE_CONFIG, FIRESTORE_SETTINGS, REGION_OR_DOMAIN } from 'ngfire';
import { Auth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { connectFunctionsEmulator, Functions } from 'firebase/functions';

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';

// Components
import { AppComponent } from './app.component';

// Angular Fire
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';

// Material
import { MatNativeDateModule } from '@angular/material/core';

// Blockframes
import { SentryModule } from '@blockframes/utils/sentry.module';
// #7936 this may be reactivated later
// import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';
import { HotjarService } from '@blockframes/utils/hotjar/hotjar.service';
import { IntercomService } from '@blockframes/utils/intercom/intercom.service';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { ErrorLoggerModule } from '@blockframes/utils/error-logger.module';
import { FinanciersModule } from './financiers.module';
import { CookieBannerModule } from '@blockframes/utils/gdpr-cookie/cookie-banner/cookie-banner.module';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';
import { getBrowserWithVersion } from '@blockframes/utils/browser/utils';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { APP } from '@blockframes/utils/routes/utils';

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Angular
    BrowserModule.withServerTransition({ appId: 'financiers-app' }),
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: production }),
    MatNativeDateModule,  // Required for Datepicker

    // Intercom
    IntercomModule.forRoot({ appId: intercomId }),

    // Firebase
    provideFirebaseApp(() => initializeApp(firebase('financiers'))), // TODO #8280 remove but used by ScreenTrackingService & UserTrackingService
    provideAuth(() => getAuth()),  // TODO #8280 remove but used by ScreenTrackingService & UserTrackingService
    provideAnalytics(() => getAnalytics()), // TODO #8280 W8 ngfire update 

    sentryDsn ? SentryModule : ErrorLoggerModule,

    // Router
    FinanciersModule,

    // Blockframes
    CookieBannerModule
  ],
  providers: [
    ScreenTrackingService, UserTrackingService,
    { provide: APP, useValue: 'financiers' },
    {
      provide: FIREBASE_CONFIG, useValue: {
        options: firebase('financiers'),
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
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(
    router: Router,
    analytics: FireAnalytics,
    intercomService: IntercomService,
    // yandexService: YandexMetricaService, #7936 this may be reactivated later
    hotjarService: HotjarService,
    gdprService: GDPRService,
    authService: AuthService,
  ) {

    const { intercom, yandex, hotjar } = gdprService.cookieConsent;
    // if (yandex) yandexService.insertMetrika('financiers'); #7936 this may be reactivated later
    if (hotjar) hotjarService.insertHotjar('catalog');
    intercom && intercomId ? intercomService.enable(authService.profile) : intercomService.disable();

    analytics.setUserProperties(getBrowserWithVersion());

    const navEnds = router.events.pipe(filter(event => event instanceof NavigationEnd));
    navEnds.subscribe((event: NavigationEnd) => {
      analytics.event('pageView', {
        page_location: 'financiers',
        page_path: event.urlAfterRedirects
      });
    });
  }
}
