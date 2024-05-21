// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { DashboardActionsShellComponent, MovieActionMenuDirective } from './actions.component';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';

// Material
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

@NgModule({
  declarations: [DashboardActionsShellComponent, MovieActionMenuDirective],
  exports: [DashboardActionsShellComponent, MovieActionMenuDirective],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    // Blockframes
    ToLabelModule,
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
