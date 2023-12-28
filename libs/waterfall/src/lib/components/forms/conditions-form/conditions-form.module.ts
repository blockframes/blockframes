
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { ChipsAutocompleteModule } from "@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module";

import { WaterfallConditionsFormComponent } from './conditions-form.component';


@NgModule({
  declarations: [ WaterfallConditionsFormComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GroupMultiselectModule,
    ChipsAutocompleteModule,

    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
  ],
  exports: [ WaterfallConditionsFormComponent ],
})
export class WaterfallConditionsFormModule {}
