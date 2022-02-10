import { filter } from 'rxjs/operators';

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { IdlePreload, IdlePreloadModule } from 'angular-idle-preload';

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { production, firebase, persistenceSettings, firebaseRegion } from '@env';

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
import 'firebase/storage';

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

import { MatNativeDateModule } from '@angular/material/core';

import { CookieBannerModule } from '@blockframes/utils/gdpr-cookie/cookie-banner/cookie-banner.module';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';
import { getBrowserWithVersion } from '@blockframes/utils/browser/utils';

import { emulatorConfig } from '../environment/environment';
import { AuthService } from '@blockframes/auth/+state';

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: production }),

    // Intercom
    IntercomModule.forRoot({ appId: intercomId }),

    // Firebase
    AngularFireModule.initializeApp(firebase('catalog')),
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
    IdlePreloadModule.forRoot(),
    RouterModule.forRoot([{
      path: '',
      loadChildren: () => import('./catalog.module').then(m => m.CatalogModule)
    }], {
      preloadingStrategy: IdlePreload,
      initialNavigation: 'enabled',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
      relativeLinkResolution: 'corrected',
      scrollPositionRestoration: 'enabled',
    }),
    MatNativeDateModule,

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
    authService: AuthService,
  ) {

    const { intercom, yandex } = gdprService.cookieConsent;
    if (yandex) yandexService.insertMetrika('catalog');
    intercom && intercomId ? intercomService.enable(authService.profile) : intercomService.disable();

    analytics.setUserProperties(getBrowserWithVersion());

    const navEnds = router.events.pipe(filter(event => event instanceof NavigationEnd));
    navEnds.subscribe((event: NavigationEnd) => {
      analytics.event('pageView', {
        page_location: 'catalog',
        page_path: event.urlAfterRedirects
      });
    });
  }
}
