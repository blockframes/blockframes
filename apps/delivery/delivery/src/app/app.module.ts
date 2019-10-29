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

// Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Libraries
import { UiFormModule, UploadModule, ToolbarModule } from '@blockframes/ui';
import { OrganizationModule, NoOrganizationModule } from '@blockframes/organization';
import { NotificationWidgetModule } from '@blockframes/notification';
import { MovieModule } from '@blockframes/movie';
import { ProfileModule, AccountModule } from '@blockframes/account';
import { WalletWidgetModule, KeyManagerModule } from '@blockframes/ethers';

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

// Component Module
import { EmailVerifyModule } from '@blockframes/auth';

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

      // Component Modules
      EmailVerifyModule,

      // Libraries
      UploadModule,
      UiFormModule,
      OrganizationModule,
      ToolbarModule,
      MovieModule,
      AccountModule,
      ProfileModule,
      WalletWidgetModule,
      KeyManagerModule,
      NotificationWidgetModule,
      NoOrganizationModule,

      // Firebase
      AngularFireModule.initializeApp(environment.firebase),
      AngularFirestoreModule.enablePersistence(environment.persistenceSettings),
      AngularFireFunctionsModule,
      AngularFireAuthModule,
      AngularFireStorageModule,

      // Akita
      AkitaNgRouterStoreModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
