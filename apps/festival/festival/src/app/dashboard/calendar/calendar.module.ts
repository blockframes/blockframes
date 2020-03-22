import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './calendar.component';

import { EventModule } from '@blockframes/event';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [CalendarComponent],
  imports: [
    CommonModule,
    EventModule,
    RouterModule.forChild([{ path: '', component: CalendarComponent }])
  ]
})
export class CalendarModule { }
