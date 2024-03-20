import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Components
import { PendingInvitationsComponent } from './pending-invitations.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    PendingInvitationsComponent,
  ],
  imports: [
    CommonModule,

    // Blockframes
    TableModule,
    DisplayNameModule,
    ToLabelModule,
    RightHolderNamePipeModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  exports: [
    PendingInvitationsComponent
  ]
})
export class PendingInvitationsModule { }
