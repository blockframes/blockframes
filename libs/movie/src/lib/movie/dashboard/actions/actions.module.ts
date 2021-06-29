// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { DashboardActionsShellComponent } from './actions.component';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MovieFeatureModule } from '../../pipes/movie-feature.pipe';
import { OrgAccessModule } from '@blockframes/organization/pipes/org-access.pipe';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardTitleShellModule } from '../shell/shell.module';

@NgModule({
  declarations: [DashboardActionsShellComponent],
  exports: [DashboardActionsShellComponent],
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
    ConfirmInputModule,
    DashboardTitleShellModule,
    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatSnackBarModule
  ],
})
export class DashboardActionsShellModule { }
