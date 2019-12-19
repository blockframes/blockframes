import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

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
import { CatalogFooterComponent } from './components/footer/footer.component';

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

@NgModule({
  declarations: [
    CatalogLandingPageComponent,
    CatalogToolbarComponent,
    CatalogHeaderComponent,
    CatalogKeyFeaturesComponent,
    CatalogViewMarketplaceComponent,
    CatalogHowItWorksComponent,
    CatalogLearnMoreComponent,
    CatalogLeftMenuComponent,
    CatalogFooterComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

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

    RouterModule.forChild([{ path: '', component: CatalogLandingPageComponent }])
  ]
})
export class LandingModule {}
