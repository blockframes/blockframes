
// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Blockframes
import { ExpenseTypesModule } from '../../expense-types/expense-types.module';

// Pages
import { ExpenseTypesFormComponent } from './form.component';

@NgModule({
  declarations: [ExpenseTypesFormComponent],
  exports: [ExpenseTypesFormComponent],
  imports: [
    CommonModule,

    ExpenseTypesModule,

    // Material
    MatButtonModule,
    MatIconModule,
  ],
})
export class ExpenseTypesFormModule { }
