import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallRevenueSimulationFormComponent, SourceNamePipe } from './revenue-simulation-form.component';
import { ExpenseTypePipeModule } from '../../../pipes/expense-type.pipe';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [WaterfallRevenueSimulationFormComponent, SourceNamePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    ExpenseTypePipeModule,
    GroupMultiselectModule,

    // Material
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatRadioModule,
  ],
  exports: [WaterfallRevenueSimulationFormComponent],
})
export class WaterfallRevenueSimulationFormModule { }
