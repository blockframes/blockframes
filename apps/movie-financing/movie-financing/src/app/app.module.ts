import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { environment } from '../environments/environment';
import { RouterModule } from '@angular/router';
// Angular Fire
import { AngularFireModule } from '@angular/fire';
// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// Libraries
import { AuthModule } from '@blockframes/auth';
import { UiFormModule, UploadModule } from '@blockframes/ui';
import { WalletModule } from '@blockframes/ethers';
// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FormComponent } from './form/form.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';


@NgModule({
  declarations: [AppComponent, HomeComponent, FormComponent, ListComponent, ViewComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent }
    ], { initialNavigation: 'enabled' }),
    // Angular Fire
    AngularFireModule.initializeApp(environment.firebase),
    // Material
    MatSnackBarModule,
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    // Libraries
    AuthModule,
    UploadModule,
    UiFormModule,
    WalletModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
