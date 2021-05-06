
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AvailsCalendarComponent } from './calendar.component';

@NgModule({
  declarations: [ AvailsCalendarComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

  ],
  exports: [ AvailsCalendarComponent ],
})
export class AvailsCalendarModule {}
