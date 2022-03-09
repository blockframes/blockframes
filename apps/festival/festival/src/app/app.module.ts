import { filter } from 'rxjs/operators';
import { emulatorConfig } from '../environment/environment';
import { firebase, firebaseRegion, intercomId, sentryDsn } from '@env';
import { IntercomModule } from 'ng-intercom';

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
import { AngularFireModule } from '@angular/fire';
import { AngularFireFunctionsModule, REGION } from '@angular/fire/functions';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirePerformanceModule, PerformanceMonitoringService } from '@angular/fire/performance';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import 'firebase/storage';

// Material
import { MatNativeDateModule } from '@angular/material/core';

// Blockframes
import { SentryModule } from '@blockframes/utils/sentry.module';
// #7936 this may be reactivated later
// import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';
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
    AngularFireModule.initializeApp(firebase('festival')),
    AngularFirestoreModule,
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
    FestivalModule,

    CookieBannerModule,
  ],
  providers: [
    ScreenTrackingService,
    UserTrackingService,
    PerformanceMonitoringService,
    { provide: REGION, useValue: firebaseRegion },
    { provide: APP, useValue: 'festival' },
    ...emulatorConfig
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    router: Router,
    analytics: FireAnalytics,
    intercomService: IntercomService,
    // yandexService: YandexMetricaService, #7936 this may be reactivated later
    gdprService: GDPRService,
    authService: AuthService,
  ) {
    const { intercom, yandex } = gdprService.cookieConsent;
    // if (yandex) yandexService.insertMetrika('catalog'); #7936 this may be reactivated later
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
