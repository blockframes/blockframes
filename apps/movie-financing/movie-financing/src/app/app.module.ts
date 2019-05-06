// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// Material
import {
  MatCardModule,
  MatChipsModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatListModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatTabsModule,
  MatToolbarModule,
  MatButtonModule,
  MatTooltipModule,
  MatInputModule,
} from '@angular/material';
// import { MatButtonModule } from '@angular/material/button';
// Akita
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { environment } from '../environments/environment';
// Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { FinancingExplorerHomeComponent } from './explorer/home/home.component';
import { FinancingExplorerDetailsComponent } from './explorer/details/details.component';
import { FinancingExplorerSearchComponent } from './explorer/search/search.component';
import { FinancingMovieCardComponent } from './explorer/movie-card/movie-card.component';
import { FinancingExplorerFooterComponent } from './explorer/footer/footer.component';
import { FinancingExplorerHeaderComponent } from './explorer/header/header.component';
import { FinancingExplorerNavbarComponent } from './explorer/navbar/navbar.component';
import { FinancingExplorerFinancingDetailsComponent } from './explorer/financing-details/financing-details.component';
import { FinancingExplorerMovieHomeComponent } from './explorer/movie-home/movie-home.component';
import { FinancingExplorerProfileComponent } from './explorer/profile/profile.component';
// Librairies
import { FinancingRangeSliderModule } from './explorer/ui/range-slider/range-slider.module';
import { ToolbarModule } from '@blockframes/ui';
import { MovieModule } from '@blockframes/movie';
import { AuthModule } from '@blockframes/auth';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { FlexModule } from '@angular/flex-layout';
import { AngularFullpageModule } from '@fullpage/angular-fullpage';


@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    FinancingExplorerHomeComponent,
    FinancingExplorerDetailsComponent,
    FinancingExplorerSearchComponent,
    FinancingMovieCardComponent,
    FinancingExplorerFooterComponent,
    FinancingExplorerHeaderComponent,
    FinancingExplorerFinancingDetailsComponent,
    FinancingExplorerNavbarComponent,
    FinancingExplorerMovieHomeComponent,
    FinancingExplorerProfileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MovieModule,
    RouterModule,
    AuthModule,
    ToolbarModule,
    // Material
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatCardModule,
    MatGridListModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatExpansionModule,
    // Akita
    AkitaNgRouterStoreModule.forRoot(),
    environment.production ? [] : [AkitaNgDevtools.forRoot()],
    AngularFireFunctionsModule,
    FlexModule,
    // Fullpage (homepage)
    AngularFullpageModule,
    MatProgressBarModule,
    FinancingRangeSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {
}
