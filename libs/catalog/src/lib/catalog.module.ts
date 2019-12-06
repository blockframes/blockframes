import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Pages
import { CatalogLandingPageComponent } from './pages/landing-page/landing-page.component';
import { CatalogFooterModule } from './components/footer/catalog-footer.module';

// Components
import { CatalogKeyFeaturesComponent } from './components/key-features/key-features.component';
import { CatalogHowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { CatalogViewMarketplaceComponent } from './components/view-marketplace/view-marketplace.component';
import { CatalogSignUpComponent } from './components/sign-up/sign-up.component';

// Libs
import { ToolbarModule } from '@blockframes/ui/toolbar/toolbar.module';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

export const routes: Routes = [{ path: '', component: CatalogLandingPageComponent }];

@NgModule({
  declarations: [
    CatalogLandingPageComponent,
    CatalogKeyFeaturesComponent,
    CatalogHowItWorksComponent,
    CatalogViewMarketplaceComponent,
    CatalogSignUpComponent,
    CatalogHowItWorksComponent
  ],
  imports: [
    CommonModule,
    ToolbarModule,
    FlexLayoutModule,
    CatalogFooterModule,

    //Material
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,

    RouterModule.forChild(routes)
  ]
})
export class CatalogModule {}
