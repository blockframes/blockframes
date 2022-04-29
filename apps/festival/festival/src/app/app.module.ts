import { filter } from 'rxjs/operators';
import { emulatorConfig } from '../environment/environment';
import { firebase, firebaseRegion, intercomId, sentryDsn } from '@env';
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

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';

// Components
import { AppComponent } from './app.component';

// Angular Fire
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { providePerformance, getPerformance } from '@angular/fire/performance';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import 'firebase/storage';

// Material
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

// Blockframes
import { SentryModule } from '@blockframes/utils/sentry.module';
// #7936 this may be reactivated later
// import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';
import { HotjarService } from '@blockframes/utils/hotjar/hotjar.service';
import { IntercomService } from '@blockframes/utils/intercom/intercom.service';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { ErrorLoggerModule } from '@blockframes/utils/error-logger.module';
import { FestivalModule } from './festival.module';
import { CookieBannerModule } from '@blockframes/utils/gdpr-cookie/cookie-banner/cookie-banner.module';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';
import { getBrowserWithVersion } from '@blockframes/utils/browser/utils';
import { AuthService } from '@blockframes/auth/+state';
import { APP } from '@blockframes/utils/routes/utils';

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Angular
    BrowserModule.withServerTransition({ appId: 'festival-app' }),
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    MatNativeDateModule, // Required for Datepicker

    // Intercom
    IntercomModule.forRoot({ appId: intercomId }),

    // Firebase
    provideFirebaseApp(() => initializeApp(firebase('festival'))), // TODO #8280 remove but used by ScreenTrackingService & UserTrackingService
    provideAuth(() =>  getAuth()),  // TODO #8280 remove but used by ScreenTrackingService & UserTrackingService
    providePerformance(() => getPerformance()), // TODO #8280 remove ?
    provideAnalytics(() => getAnalytics()), // TODO #8280 remove (test if data is saved on bigQuery)?

    sentryDsn ? SentryModule : ErrorLoggerModule,

    // Akita
    AkitaNgRouterStoreModule,

    // Router
    FestivalModule,

    CookieBannerModule,
  ],
  providers: [
    ScreenTrackingService,
    UserTrackingService,
    { provide: APP, useValue: 'festival' },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        minWidth: '50vw',
        minHeight: '50vh',
        maxWidth: '80vw',
        maxHeight: '80vh'
      }
    },
    {
      provide: FIREBASE_CONFIG, useValue: {
        options: firebase('festival'),
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
    // if (yandex) yandexService.insertMetrika('festival'); #7936 this may be reactivated later
    if (hotjar) hotjarService.insertHotjar('festival');
    intercom && intercomId ? intercomService.enable(authService.profile) : intercomService.disable();

    analytics.setUserProperties(getBrowserWithVersion());

    const navEnds = router.events.pipe(filter((event) => event instanceof NavigationEnd));
    navEnds.subscribe((event: NavigationEnd) => {
      analytics.event('pageView', {
        page_location: 'festival',
        page_path: event.urlAfterRedirects,
      });
    });
  }
}
