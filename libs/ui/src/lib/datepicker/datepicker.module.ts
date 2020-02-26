import { NgModule } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from '@angular/common';
import { DatepickerRangeComponent } from './datepicker.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {SatDatepickerModule, SatNativeDateModule} from 'saturn-datepicker';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [DatepickerRangeComponent],
  imports: [ 
    MatIconModule,
    CommonModule,
    MatButtonModule,
    SatDatepickerModule,
    SatNativeDateModule,
    MatDatepickerModule, 
    MatInputModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule
],
  exports: [DatepickerRangeComponent]
})
export class DatepickerModule {}
