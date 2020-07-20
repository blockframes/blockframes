import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { TelInputModule } from '@blockframes/ui/tel-input/tel-input.module';
import { LandingModule } from '@blockframes/landing/landing.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Pages
import { CatalogLandingComponent } from './landing.component';

// Components
import { CatalogKeyFeaturesComponent } from './key-features/key-features.component';
import { CatalogViewMarketplaceComponent } from './view-marketplace/view-marketplace.component';

// Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';

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
    LandingModule,
    ImageReferenceModule,

    // Material
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
    MatListModule,

    RouterModule.forChild([{ path: '', component: CatalogLandingComponent }])
  ]
})
export class CatalogLandingModule {}
