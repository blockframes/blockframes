import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Pages
import { CatalogLandingPageComponent } from './pages/landing-page/landing-page.component';
import { CatalogFooterModule } from './components/footer/catalog-footer.module';

// Components
import { CatalogHeaderComponent } from './components/header/header.component';
import { CatalogKeyFeaturesComponent } from './components/key-features/key-features.component';
import { CatalogHowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { CatalogViewMarketplaceComponent } from './components/view-marketplace/view-marketplace.component';
import { CatalogSignUpComponent } from './components/sign-up/sign-up.component';

// Libs
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

export const routes: Routes = [{ path: '', component: CatalogLandingPageComponent }];

@NgModule({
  declarations: [
    CatalogLandingPageComponent,
    CatalogHeaderComponent,
    CatalogKeyFeaturesComponent,
    CatalogHowItWorksComponent,
    CatalogViewMarketplaceComponent,
    CatalogSignUpComponent,
    CatalogHowItWorksComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    CatalogFooterModule,

    //Material
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatToolbarModule,

    RouterModule.forChild(routes)
  ]
})
export class CatalogModule {}
