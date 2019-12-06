import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Pages
import { CatalogLandingPageComponent } from './pages/landing-page/landing-page.component';
import { LandingPageFooterModule } from './components/lading-page-footer/landing-page-footer.module';

// Components
import { CatalogKeyFeaturesComponent } from './components/key-features/key-features.component';
import { CatalogHowItWorksComponent } from './components/how-it-works/how-it-works.component';

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
    CatalogHowItWorksComponent
  ],
  imports: [
    CommonModule,
    ToolbarModule,
    FlexLayoutModule,
    LandingPageFooterModule,

    //Material
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,

    RouterModule.forChild(routes)
  ]
})
export class CatalogModule {}
