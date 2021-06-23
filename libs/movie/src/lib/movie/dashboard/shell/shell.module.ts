// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { DashboardTitleShellComponent } from './shell.component';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MovieFeatureModule } from '../../pipes/movie-feature.pipe';
import { OrgAccessModule } from '@blockframes/organization/pipes/org-access.pipe';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [DashboardTitleShellComponent],
  exports: [DashboardTitleShellComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    // Blockframes
    MovieFeatureModule,
    ToLabelModule,
    DisplayNameModule,
    ImageModule,
    OrgAccessModule,

    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
})
export class DashboardTitleShellModule { }
