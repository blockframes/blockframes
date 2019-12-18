import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Router, NavigationEnd } from '@angular/router';

// Libraries
import { AngularFireAnalyticsModule } from '@blockframes/utils/analytics/analytics.module';

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { environment } from '../environments/environment';

// Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirePerformanceModule } from '@angular/fire/performance';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Sentry
import { SentryModule } from '@blockframes/utils/sentry.module';
import { sentryDsn } from '@env';

// Yandex Metrika
import { NgxMetrikaModule } from '@kolkov/ngx-metrika';
import { yandexId } from '@env';

// Intercom
import { IntercomAppModule } from '@blockframes/utils/intercom.module';
import { intercomId } from '@env';

// Analytics
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FlexLayoutModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),

    // Intercom
    intercomId ? IntercomAppModule : [],

    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(environment.persistenceSettings),
    AngularFireFunctionsModule,
    AngularFirePerformanceModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireAnalyticsModule,
    // Analytics
    sentryDsn ? SentryModule : [],

    // Akita
    AkitaNgRouterStoreModule.forRoot(),

    // Yandex Metrika
    NgxMetrikaModule.forRoot({
      id: yandexId,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  private subscription: Subscription;

  constructor(private router: Router, private analytics: FireAnalytics) {
    const navEnds = this.router.events.pipe(filter(event => event instanceof NavigationEnd));
    this.subscription = navEnds.subscribe((event: NavigationEnd) => {
      try {
        this.analytics.event('page_view', {
          page_location: 'marketplace',
          page_path: event.urlAfterRedirects
        });
      } catch {
        this.analytics.event('page_view', {
          page_location: 'marketplace',
          page_path: event.urlAfterRedirects
        });
      }
    });
  }
}

