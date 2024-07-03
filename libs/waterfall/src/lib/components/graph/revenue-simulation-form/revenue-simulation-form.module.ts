import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallRevenueSimulationFormComponent, SourceNamePipe } from './revenue-simulation-form.component';
import { ExpenseTypePipeModule } from '../../../pipes/expense-type.pipe';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [WaterfallRevenueSimulationFormComponent, SourceNamePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    ExpenseTypePipeModule,

    // Material
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule,
    MatSlideToggle,
  ],
  exports: [WaterfallRevenueSimulationFormComponent],
})
export class WaterfallRevenueSimulationFormModule { }
