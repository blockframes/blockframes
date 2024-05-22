
// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Blockframes
import { ExpenseTypesModule } from '../../expense/expense-types/expense-types.module';

// Pages
import { ExpenseTypesFormComponent } from './form.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [ExpenseTypesFormComponent],
  exports: [ExpenseTypesFormComponent],
  imports: [
    CommonModule,

    ExpenseTypesModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
})
export class ExpenseTypesFormModule { }
