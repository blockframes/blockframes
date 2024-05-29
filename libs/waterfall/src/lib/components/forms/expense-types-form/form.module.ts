
// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Blockframes
import { ExpenseTypesModule } from '../../expense/expense-types/expense-types.module';

// Pages
import { ExpenseTypesFormComponent } from './form.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

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
