import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { TelInputModule } from '@blockframes/ui/tel-input/tel-input.module';
import { LandingShellModule } from '@blockframes/landing/shell/shell.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Pages
import { CatalogLandingComponent } from './landing.component';

// Components
import { CatalogKeyFeaturesComponent } from './key-features/key-features.component';
import { CatalogViewMarketplaceComponent } from './view-marketplace/view-marketplace.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    CatalogLandingComponent,
    CatalogKeyFeaturesComponent,
    CatalogViewMarketplaceComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    AppLogoModule,
    TelInputModule,
    LandingShellModule,
    ImageReferenceModule,

    // Material
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: CatalogLandingComponent }])
  ]
})
export class CatalogLandingModule { }
