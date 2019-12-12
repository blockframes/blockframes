import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Pages
import { CatalogLandingPageComponent } from './pages/landing-page/landing-page.component';

// Components
import { CatalogToolbarComponent } from './components/toolbar/toolbar.component';
import { CatalogHeaderComponent } from './components/header/header.component';
import { CatalogKeyFeaturesComponent } from './components/key-features/key-features.component';
import { CatalogHowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { CatalogViewMarketplaceComponent } from './components/view-marketplace/view-marketplace.component';
import { CatalogLearnMoreComponent } from './components/learn-more/learn-more.component';
import { CatalogLeftMenuComponent } from './components/left-menu/left-menu.component';


@NgModule({
  declarations: [
    CatalogLandingPageComponent,
    CatalogToolbarComponent,
    CatalogHeaderComponent,
    CatalogKeyFeaturesComponent,
    CatalogViewMarketplaceComponent,
    CatalogHowItWorksComponent,
    CatalogLearnMoreComponent,
    CatalogLeftMenuComponent
  ],
  imports: [CommonModule, RouterModule.forChild([{ path: '', component: CatalogLandingPageComponent }])]
})
export class LandingModule {}
