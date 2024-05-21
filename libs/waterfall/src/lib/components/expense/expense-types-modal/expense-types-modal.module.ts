import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ExpenseTypesModalComponent } from './expense-types-modal.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { ExpenseTypesModule } from '../expense-types/expense-types.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [ExpenseTypesModalComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GlobalModalModule,
    ExpenseTypesModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,

  ],
  exports: [ExpenseTypesModalComponent]
})
export class ExpenseTypesModalModule { }
