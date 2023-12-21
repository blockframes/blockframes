// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ExpenseTypesComponent } from './expense-types.component';

// Blockframes 
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ExpenseTypesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    StaticSelectModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,

  ],
  exports: [ExpenseTypesComponent]
})
export class ExpenseTypesModule { }
