﻿import { filter } from 'rxjs/operators';
import { emulatorConfig } from '../environment/environment';
import { firebase, firebaseRegion, intercomId, sentryDsn } from '@env';
import { IntercomModule } from '@supy-io/ngx-intercom';

// NgFire
import { FIREBASE_CONFIG, FIRESTORE_SETTINGS, REGION_OR_DOMAIN } from 'ngfire';

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';

// Components
import { AppComponent } from './app.component';

// Material
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
// Blockframes
import { SentryModule } from '@blockframes/utils/sentry.module';
// #7936 this may be reactivated later
// import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';
import { HotjarService } from '@blockframes/utils/hotjar/hotjar.service';
import { IntercomService } from '@blockframes/utils/intercom/intercom.service';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { ErrorLoggerModule } from '@blockframes/utils/error-logger.module';
import { WaterfallModule } from './waterfall.module';
import { CookieBannerModule } from '@blockframes/utils/gdpr-cookie/cookie-banner/cookie-banner.module';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';
import { getBrowserWithVersion } from '@blockframes/utils/browser/utils';
import { AuthService } from '@blockframes/auth/service';
import { APP } from '@blockframes/utils/routes/utils';
import { EMULATORS_CONFIG, setupEmulators } from '@blockframes/utils/emulator-front-setup';
import { VersionModule } from '@blockframes/utils/version/version.module';
import { BlockframesDateAdapter } from '@blockframes/utils/date-adapter';
import { getUserLocaleId } from '@blockframes/model';

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Angular
    BrowserModule.withServerTransition({ appId: 'waterfall-app' }),
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    MatNativeDateModule, // Required for Datepicker

    // Intercom
    IntercomModule.forRoot({ appId: intercomId }),

    sentryDsn ? SentryModule : ErrorLoggerModule,

    // Router
    WaterfallModule,

    // Blockframes
    CookieBannerModule,
    VersionModule,
  ],
  providers: [
    { provide: APP, useValue: 'waterfall' },
    { provide: EMULATORS_CONFIG, useValue: emulatorConfig },
    {
      provide: FIREBASE_CONFIG, useValue: {
        options: firebase('waterfall'),
        ...setupEmulators(emulatorConfig)
      }
    },
    { provide: FIRESTORE_SETTINGS, useValue: { ignoreUndefinedProperties: true, experimentalAutoDetectLongPolling: true } },
    { provide: REGION_OR_DOMAIN, useValue: firebaseRegion },
    { provide: MAT_DATE_LOCALE, useValue: getUserLocaleId() },
    { provide: DateAdapter, useClass: BlockframesDateAdapter, deps: [MAT_DATE_LOCALE] }
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
    authService: AuthService
  ) {
    const { intercom, yandex, hotjar } = gdprService.cookieConsent;

    // if (yandex) yandexService.insertMetrika('waterfall'); #7936 this may be reactivated later
    if (hotjar) hotjarService.insertHotjar('waterfall');
    intercom && intercomId ? intercomService.enable(authService.profile) : intercomService.disable();

    analytics.setUserProperties(getBrowserWithVersion());

    const navEnds = router.events.pipe(filter((event) => event instanceof NavigationEnd));
    navEnds.subscribe((event: NavigationEnd) => {
      analytics.event('pageView', {
        page_location: 'waterfall',
        page_path: event.urlAfterRedirects,
      });
    });
  }
}
