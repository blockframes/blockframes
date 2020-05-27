import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { TelInputModule } from '@blockframes/ui/tel-input/tel-input.module';
import { LandingModule } from '@blockframes/landing/landing.module';

// Pages
import { CatalogLandingPageComponent } from './pages/landing-page/landing-page.component';

// Components
import { CatalogKeyFeaturesComponent } from './components/key-features/key-features.component';
import { CatalogViewMarketplaceComponent } from './components/view-marketplace/view-marketplace.component';
import { CatalogLeftMenuComponent } from './components/left-menu/left-menu.component';

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

const routes = [
  {
    path: '',
    component: CatalogLandingPageComponent,
    children: [
      {
        path: ''
        // loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'about'
        // loadChildren: () => import()
      },
      {
        path: 'faq'
        // loadChildren: () => import()
      }
    ]
  }
];

@NgModule({
  declarations: [
    CatalogLandingPageComponent,
    CatalogKeyFeaturesComponent,
    CatalogViewMarketplaceComponent,
    CatalogLeftMenuComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    AppLogoModule,
    TelInputModule,
    LandingModule,

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

    RouterModule.forChild([{ path: '', component: CatalogLandingPageComponent }])
  ]
})
export class CatalogLandingModule {}
