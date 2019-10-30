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
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';

// Libraries
import { ToolbarModule } from '@blockframes/ui';
import { MovieModule } from '@blockframes/movie';
import { OrganizationWidgetModule } from '@blockframes/organization';
import { ProfileWidgetModule, ProfileMenuModule } from '@blockframes/account';
import { WalletWidgetModule } from '@blockframes/ethers';
import { KeyManagerModule } from '@blockframes/ethers';
import { NotificationWidgetModule } from '@blockframes/notification';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';

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

    // Libraries
    OrganizationWidgetModule,
    ToolbarModule,
    MovieModule,
    ProfileWidgetModule,
    ProfileMenuModule,
    WalletWidgetModule,
    KeyManagerModule,
    NotificationWidgetModule,

    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(environment.persistenceSettings),
    AngularFireFunctionsModule,
    AngularFireStorageModule,
    AngularFireAuthModule,

    // Akita
    AkitaNgRouterStoreModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

