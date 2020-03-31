import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimePickerComponent } from './time-picker.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';



@NgModule({
  declarations: [TimePickerComponent],
  exports: [TimePickerComponent, MatDatepickerModule],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
  ]
})
export class TimePickerModule { }
