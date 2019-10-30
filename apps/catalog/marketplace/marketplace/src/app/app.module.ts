// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { environment } from '../environments/environment';

// Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirePerformanceModule } from '@angular/fire/performance';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Libraries
import { ToolbarModule } from '@blockframes/ui';
import { OrganizationModule } from '@blockframes/organization';
import { ProfileWidgetModule, ProfileMenuModule } from '@blockframes/account';
import { WalletWidgetModule } from '@blockframes/ethers';
import { KeyManagerModule } from '@blockframes/ethers';
import { NotificationWidgetModule } from '@blockframes/notification';

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

// Yandex Metrika
import { NgxMetrikaModule } from '@kolkov/ngx-metrika';
import { yandexId } from '@env';

// Intercom
import { IntercomAppModule } from '@blockframes/utils/intercom.module';
import { intercomId } from '@env';

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
    OrganizationModule,
    ToolbarModule,
    ProfileWidgetModule,
    ProfileMenuModule,
    WalletWidgetModule,
    KeyManagerModule,
    NotificationWidgetModule,

    // Intercom
    intercomId ? IntercomAppModule : [],

    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(environment.persistenceSettings),
    AngularFireFunctionsModule,
    AngularFirePerformanceModule,
    AngularFireAuthModule,
    AngularFireStorageModule,

    // Akita
    AkitaNgRouterStoreModule.forRoot(),

    // Yandex Metrika
    NgxMetrikaModule.forRoot({
      id: yandexId,
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
