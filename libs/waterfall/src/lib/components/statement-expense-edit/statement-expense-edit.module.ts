import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { StatementExpenseEditComponent } from './statement-expense-edit.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExpenseTypePipeModule } from '@blockframes/waterfall/pipes/expense-type.pipe';

@NgModule({
  declarations: [StatementExpenseEditComponent],
  imports: [
    CommonModule,
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

    RouterModule,
  ],
  exports: [StatementExpenseEditComponent]
})
export class StatementExpenseEditModule { }
