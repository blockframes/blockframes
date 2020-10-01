// Angular
import { BrowserModule } from '@angular/platform-browser';
import { Inject, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { persistenceSettings } from '@env';

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
import { YandexMetricaModule } from '@blockframes/utils/yandex-metrica/yandex-metrica.module'
import { YandexMetricaService, YM_CONFIG } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';
import { yandexId } from '@env';

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

import { SafariBannerModule } from '@blockframes/utils/safari-banner/safari-banner.module';
import { CookieBannerModule } from '@blockframes/utils/gdpr-cookie/cookie-banner/cookie-banner.module';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';

import { environment } from '../environments/environment';
import { firebase } from '@env';

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Angular
    BrowserModule.withServerTransition({ appId: 'financiers-app' }),
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    MatNativeDateModule,  // Required for Datepicker

    // Intercom
    IntercomModule.forRoot({ appId: intercomId }),

    // Firebase
    AngularFireModule.initializeApp(firebase),
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

    // Yandex Metrika
    YandexMetricaModule.forRoot(yandexId),

    // Router
    FinanciersModule,

    // Blockframes
    SafariBannerModule,
    CookieBannerModule
  ],
  providers: [
    ScreenTrackingService, UserTrackingService, PerformanceMonitoringService,
    { provide: REGION, useValue: 'europe-west1' },
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
    @Inject(YM_CONFIG) ymConfig: number
  ) {

    const { googleAnalytics, intercom, yandex } = gdprService.cookieConsent;
    if (!googleAnalytics) analytics.analytics.setAnalyticsCollectionEnabled(false);
    if (yandex) yandexService.insertMetrika(ymConfig);
    intercom && intercomId ? intercomService.enable() : intercomService.disable();

    const navEnds = router.events.pipe(filter(event => event instanceof NavigationEnd));
    navEnds.subscribe((event: NavigationEnd) => {
      try {
        analytics.event('pageView', {
          page_location: 'marketplace',
          page_path: event.urlAfterRedirects
        });
      } catch {
        analytics.event('pageView', {
          page_location: 'marketplace',
          page_path: event.urlAfterRedirects
        });
      }
    });
  }
}
