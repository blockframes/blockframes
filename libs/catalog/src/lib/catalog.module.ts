import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Pages
import { CatalogLandingPageComponent } from './landing-page/pages/landing-page/landing-page.component';

// Components
import { CatalogToolbarComponent } from './landing-page/components/toolbar/toolbar.component';
import { CatalogHeaderComponent } from './landing-page/components/header/header.component';
import { CatalogKeyFeaturesComponent } from './landing-page/components/key-features/key-features.component';
import { CatalogHowItWorksComponent } from './landing-page/components/how-it-works/how-it-works.component';
import { CatalogViewMarketplaceComponent } from './landing-page/components/view-marketplace/view-marketplace.component';
import { CatalogLearnMoreComponent } from './landing-page/components/learn-more/learn-more.component';
import { CatalogFooterModule } from './landing-page/components/footer/catalog-footer.module';

// Libs
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export const routes: Routes = [{ path: '', component: CatalogLandingPageComponent }];

@NgModule({
  declarations: [
    CatalogLandingPageComponent,
    CatalogToolbarComponent,
    CatalogHeaderComponent,
    CatalogKeyFeaturesComponent,
    CatalogHowItWorksComponent,
    CatalogViewMarketplaceComponent,
    CatalogHowItWorksComponent,
    CatalogLearnMoreComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    CatalogFooterModule,

    //Material
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

    RouterModule.forChild(routes)
  ]
})
export class CatalogModule {}
