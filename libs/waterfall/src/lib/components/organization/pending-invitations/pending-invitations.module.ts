import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Components
import { PendingInvitationsComponent } from './pending-invitations.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

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
