// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import localeFr from '@angular/common/locales/fr';
import { RouterModule } from '@angular/router';
// Material
import {
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatBadgeModule
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
import { FinancingMovieCardHorizontalComponent } from './explorer/movie-card-horizontal/movie-card-horizontal.component';
import { registerLocaleData } from '@angular/common';
import { FinancingExplorerCompareComponent } from './explorer/compare/compare.component';
registerLocaleData(localeFr)

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    FinancingExplorerHomeComponent,
    FinancingExplorerDetailsComponent,
    FinancingExplorerSearchComponent,
    FinancingMovieCardComponent,
    FinancingMovieCardHorizontalComponent,
    FinancingExplorerFooterComponent,
    FinancingExplorerHeaderComponent,
    FinancingExplorerFinancingDetailsComponent,
    FinancingExplorerNavbarComponent,
    FinancingExplorerMovieHomeComponent,
    FinancingExplorerProfileComponent,
    FinancingExplorerCompareComponent,
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
    MatBadgeModule,
    // Akita
    AkitaNgRouterStoreModule.forRoot(),
    environment.production ? [] : [AkitaNgDevtools.forRoot()],
    AngularFireFunctionsModule,
    FlexModule,
    // Fullpage (homepage)
    AngularFullpageModule,
    MatProgressBarModule,
    FinancingRangeSliderModule,
    MatMenuModule
  ],
  providers: [{
      provide: LOCALE_ID,
      useValue: 'fr-FR'
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
