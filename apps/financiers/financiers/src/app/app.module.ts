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
import { persistenceSettings } from '@env';

// Components
import { AppComponent } from './app.component';

// Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
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
import { yandexId } from '@env';

// Intercom
import { IntercomAppModule } from '@blockframes/utils/intercom/intercom.module';
import { intercomId } from '@env';

// Analytics
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { ErrorLoggerModule } from '@blockframes/utils/error-logger.module';
import { FinanciersModule } from './financiers.module';

import { filter } from 'rxjs/operators';
import { MatNativeDateModule } from '@angular/material/core';

import { SafariBannerModule } from '@blockframes/utils/safari-banner/safari-banner.module';
import { environment } from '../environments/environment';

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
    intercomId ? IntercomAppModule : [],

    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
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

    SafariBannerModule,
  ],
  providers: [ScreenTrackingService, UserTrackingService, PerformanceMonitoringService],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(private router: Router, private analytics: FireAnalytics) {
    const navEnds = this.router.events.pipe(filter(event => event instanceof NavigationEnd));
    navEnds.subscribe((event: NavigationEnd) => {
      try {
        this.analytics.event('pageView', {
          page_location: 'marketplace',
          page_path: event.urlAfterRedirects
        });
      } catch {
        this.analytics.event('pageView', {
          page_location: 'marketplace',
          page_path: event.urlAfterRedirects
        });
      }
    });
  }
}
