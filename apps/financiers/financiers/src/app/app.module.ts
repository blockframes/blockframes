// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { firebaseRegion, persistenceSettings } from '@env';

// Components
import { AppComponent } from './app.component';

// Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFireFunctionsModule, REGION } from '@angular/fire/functions';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirePerformanceModule, PerformanceMonitoringService } from '@angular/fire/performance';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';

// Sentry
import { SentryModule } from '@blockframes/utils/sentry.module';
import { sentryDsn } from '@env';

// Yandex Metrika
import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';

// Intercom
import { IntercomModule } from 'ng-intercom';
import { IntercomService } from '@blockframes/utils/intercom/intercom.service';
import { intercomId } from '@env';

// Analytics
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { ErrorLoggerModule } from '@blockframes/utils/error-logger.module';
import { FinanciersModule } from './financiers.module';

import { filter } from 'rxjs/operators';
import { MatNativeDateModule } from '@angular/material/core';

import { CookieBannerModule } from '@blockframes/utils/gdpr-cookie/cookie-banner/cookie-banner.module';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';

import { firebase, production } from '@env';
import { getBrowserWithVersion } from '@blockframes/utils/browser/utils';
import { emulatorConfig } from '../environment/environment';

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
    AngularFireModule.initializeApp(firebase('financiers')),
    AngularFirestoreModule.enablePersistence(persistenceSettings),
    AngularFireFunctionsModule,
    AngularFirePerformanceModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireAnalyticsModule,
    // Analytics
    sentryDsn ? SentryModule : ErrorLoggerModule,

    // Akita
    AkitaNgRouterStoreModule,

    // Router
    FinanciersModule,

    // Blockframes
    CookieBannerModule
  ],
  providers: [
    ScreenTrackingService, UserTrackingService, PerformanceMonitoringService,
    { provide: REGION, useValue: firebaseRegion },
    ...emulatorConfig
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(
    router: Router,
    analytics: FireAnalytics,
    intercomService: IntercomService,
    yandexService: YandexMetricaService,
    gdprService: GDPRService,
  ) {

    const { intercom, yandex } = gdprService.cookieConsent;
    if (yandex) yandexService.insertMetrika('financiers');
    intercom && intercomId ? intercomService.enable() : intercomService.disable();

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
