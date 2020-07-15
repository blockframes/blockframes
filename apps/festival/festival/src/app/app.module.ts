// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { firebase, persistenceSettings } from '@env';

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
import 'firebase/storage';

// Sentry
import { SentryModule } from '@blockframes/utils/sentry.module';
import { sentryDsn } from '@env';

// Yandex Metrika
import { YandexMetricaModule } from '@blockframes/utils/yandex-metrica/yandex-metrica.module'
import { yandexId } from '@env';

// Intercom
import { IntercomAppModule } from '@blockframes/utils/intercom.module';
import { intercomId } from '@env';

// Analytics
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { ErrorLoggerModule } from '@blockframes/utils/error-logger.module';
import { FestivalModule } from './festival.module';

import { filter } from 'rxjs/operators';
import { MatNativeDateModule } from '@angular/material/core';

import { SafariBannerModule } from '@blockframes/utils/safari-banner/safari-banner.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Angular
    BrowserModule.withServerTransition({ appId: 'festival-app' }),
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    MatNativeDateModule,  // Required for Datepicker

    // Intercom
    intercomId ? IntercomAppModule : [],

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
    FestivalModule,

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
