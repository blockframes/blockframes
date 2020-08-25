// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { MovieFormBudgetComponent } from './budget.component';

// Blockframes
import { QueryListFindModule } from '@blockframes/utils/pipes/find.pipe';

// Material
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    QueryListFindModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatFormFieldModule,
    MatSelectModule,
  ],
  declarations: [MovieFormBudgetComponent],
  exports: [MovieFormBudgetComponent]
})
export class MovieFormBudgetModule { }
