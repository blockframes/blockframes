import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing.module';

// Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Akita
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { environment } from '../environments/environment';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';

// Libraries
import { AuthModule } from '@blockframes/auth';
import { UploadModule } from '@blockframes/ui';
import { WalletModule } from '@blockframes/ethers';

// Components
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FormComponent } from './form/form.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [AppComponent, FormComponent, ListComponent, ViewComponent, HomeComponent],
  imports: [
    BrowserModule,
    AuthModule,
    UploadModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    WalletModule,
    AppRoutingModule,
    // Angular Fire
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    // Material
    MatSnackBarModule,
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatRippleModule,
    // Akita
    environment.production ? [] : [AkitaNgDevtools.forRoot(), AkitaNgRouterStoreModule.forRoot()],
    // Service Worker
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
