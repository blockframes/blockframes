// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { DashboardActionsShellComponent } from './actions.component';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';
import { OrgAccessModule } from '@blockframes/organization/pipes/org-access.pipe';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [DashboardActionsShellComponent],
  exports: [DashboardActionsShellComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    // Blockframes
    ToLabelModule,
    OrgAccessModule,
    ConfirmInputModule,
    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule
  ],
})
export class DashboardActionsShellModule { }
