import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

//Pages
import { CatalogLandingPageComponent } from './pages/landing-page/landing-page.component';

// Libs
import { ToolbarModule } from '@blockframes/ui/toolbar/toolbar.module';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export const routes: Routes = [{ path: '', component: CatalogLandingPageComponent }];

@NgModule({
  declarations: [CatalogLandingPageComponent],
  imports: [
    CommonModule,
    ToolbarModule,
    FlexLayoutModule,

    //Material
    MatIconModule,
    MatButtonModule,

    RouterModule.forChild(routes)
  ]
})
export class CatalogModule {}
