import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { StatementExpenseEditComponent } from './statement-expense-edit.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';
import { ExpenseTypePipeModule } from '../../../pipes/expense-type.pipe';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [StatementExpenseEditComponent],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,

    GlobalModalModule,
    RightHolderNamePipeModule,
    ExpenseTypePipeModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  exports: [StatementExpenseEditComponent]
})
export class StatementExpenseEditModule { }
