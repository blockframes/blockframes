import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimePickerComponent } from './time-picker.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [TimePickerComponent],
  exports: [TimePickerComponent, MatDatepickerModule],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatIconModule,
  ]
})
export class TimePickerModule { }
