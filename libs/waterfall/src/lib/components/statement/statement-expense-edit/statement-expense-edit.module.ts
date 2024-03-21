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
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

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