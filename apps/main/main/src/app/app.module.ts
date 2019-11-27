// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { environment } from '../environments/environment';

// Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing-module';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';

// Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirePerformanceModule } from '@angular/fire/performance';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Libraries
import { ToolbarModule } from '@blockframes/ui';
import { KeyManagerModule } from '@blockframes/ethers';
import { EmailVerifyModule } from '@blockframes/auth';

// Widgets
import { ProfileWidgetModule, ProfileMenuModule } from '@blockframes/account';
import { NotificationWidgetModule } from '@blockframes/notification';
import { ThemeWidgetModule } from '@blockframes/ui/theme';
import { WalletWidgetModule } from '@blockframes/ethers';
import { OrganizationWidgetModule } from '@blockframes/organization';

// Material
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppGridComponent } from './app-grid/app-grid.component';

// Sentry
import { SentryModule } from '@blockframes/utils';
import { sentryDsn } from '@env';

@NgModule({
  declarations: [AppComponent, LayoutComponent, HomeComponent, AppGridComponent],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FlexLayoutModule,
    HttpClientModule,

    // Material
    MatSnackBarModule,
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatRippleModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatBadgeModule,

    // Libraries
    ToolbarModule,
    ProfileMenuModule,
    KeyManagerModule,
    EmailVerifyModule,

    // Widget
    OrganizationWidgetModule,
    ThemeWidgetModule,
    NotificationWidgetModule,
    WalletWidgetModule,
    ProfileWidgetModule,

    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(environment.persistenceSettings),
    AngularFireFunctionsModule,
    AngularFirePerformanceModule,
    AngularFireAuthModule,
    AngularFireStorageModule,

    // Analytics
    sentryDsn ? SentryModule : [],

    // Akita
    AkitaNgRouterStoreModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

