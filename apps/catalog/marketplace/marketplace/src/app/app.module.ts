// Angular
import { OnDestroy } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Inject } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { environment } from '../environments/environment';

// Angular Fire
import { AngularFireAnalyticsModule, ANALYTICS, Analytics } from '@blockframes/utils';
import { AngularFireModule } from '@angular/fire';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirePerformanceModule } from '@angular/fire/performance';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Libraries
import { ToolbarModule } from '@blockframes/ui';
import { OrganizationWidgetModule } from '@blockframes/organization';
import { ProfileWidgetModule, ProfileMenuModule } from '@blockframes/account';
import { WalletWidgetModule } from '@blockframes/ethers';
import { KeyManagerModule } from '@blockframes/ethers';
import { NotificationWidgetModule } from '@blockframes/notification';
import { EmailVerifyModule } from '@blockframes/auth';


// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

// Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing-module';
import { LayoutComponent } from './layout/layout.component';

// Sentry
import { SentryModule } from '@blockframes/utils';
import { sentryDsn } from '@env';

// Yandex Metrika
import { NgxMetrikaModule } from '@kolkov/ngx-metrika';
import { yandexId } from '@env';

// Intercom
import { IntercomAppModule } from '@blockframes/utils/intercom.module';
import { intercomId } from '@env';

// Analytics
import { AuthQuery } from '@blockframes/auth';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@NgModule({
  declarations: [AppComponent, LayoutComponent],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FlexLayoutModule,
    HttpClientModule,

    // Material
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatMenuModule,

    // Libraries
    OrganizationWidgetModule,
    ToolbarModule,
    ProfileWidgetModule,
    ProfileMenuModule,
    WalletWidgetModule,
    KeyManagerModule,
    NotificationWidgetModule,
    EmailVerifyModule,

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
export class AppModule implements OnDestroy {
  private subscription: Subscription;

  constructor(
    private router: Router,
    @Inject(ANALYTICS) private logService: Analytics,
    private authQuery: AuthQuery
  ) {
    const navEnds = this.router.events.pipe(filter(event => event instanceof NavigationEnd));
    this.subscription = navEnds.subscribe((event: NavigationEnd) => {
      this.logService.logEvent('page_view', {
        page_location: 'marketplace',
        page_path: event.urlAfterRedirects,
        uid: this.authQuery.getValue().user.uid
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
