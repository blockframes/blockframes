import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventViewComponent } from './view.component';



@NgModule({
  declarations: [EventViewComponent],
  exports: [EventViewComponent],
  imports: [
    CommonModule
  ]
})
export class EventViewModule { }
