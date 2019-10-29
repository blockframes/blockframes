// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import localeFr from '@angular/common/locales/fr';
import { RouterModule } from '@angular/router';
// Material
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';

// Akita
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { environment } from '../environments/environment';

// Modules


// Angular Fire
import { AngularFirestoreModule } from '@angular/fire/firestore';

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
import { AuthModule } from '@blockframes/auth/auth.module';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { FlexModule } from '@angular/flex-layout';
import { AngularFullpageModule } from '@fullpage/angular-fullpage';
import { FinancingMovieCardHorizontalComponent } from './explorer/movie-card-horizontal/movie-card-horizontal.component';
import { registerLocaleData } from '@angular/common';
import { FinancingExplorerCompareComponent } from './explorer/compare/compare.component';
import { UtilsModule } from '@blockframes/utils';
import { AccountModule, ProfileModule } from '@blockframes/account';
import { WalletModule, KeyManagerModule } from '@blockframes/ethers';
import { MatRadioModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    FormsModule,
    ReactiveFormsModule,
    MovieModule,
    RouterModule,
    AuthModule,
    ToolbarModule,
    AccountModule,
    ProfileModule,
    UtilsModule,
    WalletModule,
    KeyManagerModule,
    // Material
    MatSidenavModule,
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
    MatMenuModule,
    MatRadioModule,
    // Akita
    AkitaNgRouterStoreModule.forRoot(),
    AngularFireFunctionsModule,
    AngularFirestoreModule.enablePersistence(environment.persistenceSettings),
    FlexModule,
    // Fullpage (homepage)
    AngularFullpageModule,
    MatProgressBarModule,
    FinancingRangeSliderModule,

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
