import { filter } from 'rxjs/operators';
import { emulatorConfig } from '../environment/environment';
import { production, firebase, firebaseRegion, sentryDsn, intercomId } from '@env';
import { IntercomModule } from 'ng-intercom';

// NgFire
import { FIREBASE_CONFIG, FIRESTORE_SETTINGS, REGION_OR_DOMAIN } from 'ngfire';

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { IdlePreload, IdlePreloadModule } from 'angular-idle-preload';

// Components
import { AppComponent } from './app.component';

// Material
import { MatNativeDateModule } from '@angular/material/core';

// Blockframes
import { IntercomService } from '@blockframes/utils/intercom/intercom.service';
import { SentryModule } from '@blockframes/utils/sentry.module';
// #7936 this may be reactivated later
// import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';
import { HotjarService } from '@blockframes/utils/hotjar/hotjar.service';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { ErrorLoggerModule } from '@blockframes/utils/error-logger.module';
import { CookieBannerModule } from '@blockframes/utils/gdpr-cookie/cookie-banner/cookie-banner.module';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';
import { getBrowserWithVersion } from '@blockframes/utils/browser/utils';
import { AuthService } from '@blockframes/auth/service';
import { APP } from '@blockframes/utils/routes/utils';
import { EMULATORS_CONFIG, setupEmulators } from '@blockframes/utils/emulator-front-setup';
import { AppUtilsModule } from '@blockframes/utils/app-utils/app-utils.module';

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

    sentryDsn ? SentryModule : ErrorLoggerModule,

    // Router
    IdlePreloadModule.forRoot(),
    RouterModule.forRoot([{
      path: '',
      loadChildren: () => import('./catalog.module').then(m => m.CatalogModule)
    }], {
      preloadingStrategy: IdlePreload,
      initialNavigation: 'enabledBlocking',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
      relativeLinkResolution: 'corrected',
      scrollPositionRestoration: 'enabled',
    }),
    MatNativeDateModule,

    // Blockframes
    CookieBannerModule,
    AppUtilsModule
  ],
  providers: [
    { provide: APP, useValue: 'catalog' },
    { provide: EMULATORS_CONFIG, useValue: emulatorConfig },
    {
      provide: FIREBASE_CONFIG, useValue: {
        options: firebase('catalog'),
        ...setupEmulators(emulatorConfig)
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
    // if (yandex) yandexService.insertMetrika('catalog'); #7936 this may be reactivated later
    if (hotjar) hotjarService.insertHotjar('catalog');
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
