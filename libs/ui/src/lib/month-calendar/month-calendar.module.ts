import { NgModule } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { CalendarComponent } from './month-calendar.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [CalendarComponent],
  imports: [
    MatGridListModule, 
    MatIconModule,
    CommonModule,
    MatButtonModule
],
  exports: [CalendarComponent]
})
export class MonthCalendarModule {}
