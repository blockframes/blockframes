// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// Akita
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { environment } from '../environments/environment';
// Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LayoutComponent } from './layout/layout.component';
// Librairies
import { AuthModule } from '@blockframes/auth';
import { ToolbarModule } from '@blockframes/ui';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { OrganizationModule } from '@blockframes/organization';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MovieModule } from '@blockframes/movie';

// Libraries
// tslint:disable-next-line: nx-enforce-module-boundaries

@NgModule({
  declarations: [AppComponent, LayoutComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MovieModule,
    RouterModule,
    AuthModule,
    ToolbarModule,
    ToolbarModule,
    // Librairies
    OrganizationModule,
    // Akita
    environment.production ? [] : [AkitaNgDevtools.forRoot()]
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
