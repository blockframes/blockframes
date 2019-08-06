import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing.module';
// Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
// Akita
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { environment } from '../environments/environment';
// Material
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
// Libraries
import { AuthModule } from '@blockframes/auth';
import { UiFormModule, UploadModule, ToolbarModule } from '@blockframes/ui';
import { WalletModule } from '@blockframes/ethers';
import { OrganizationModule } from '@blockframes/organization';
// Components
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { LayoutComponent } from './layout/layout.component';
import { UtilsModule } from '@blockframes/utils';
import { AccountModule, ProfileModule } from '@blockframes/account';

@NgModule({
  declarations: [AppComponent, LayoutComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AuthModule,
    UploadModule,
    UiFormModule,
    WalletModule,
    OrganizationModule,
    ToolbarModule,
    AccountModule,
    ProfileModule,
    UtilsModule,
    // Angular Fire
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(environment.persistenceSettings),
    AngularFireStorageModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    // Material
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    // Akita
    AkitaNgRouterStoreModule.forRoot(),
    environment.production ? [] : [AkitaNgDevtools.forRoot()],
    // Service Worker
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [{ provide: FirestoreSettingsToken, useValue: {} }], // TODO: Remove when @angular/fire is updated
  bootstrap: [AppComponent]
})
export class AppModule {
}
