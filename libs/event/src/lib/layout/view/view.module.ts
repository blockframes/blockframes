import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventViewComponent } from './view.component';
import { FlexLayoutModule } from '@angular/flex-layout';



@NgModule({
  declarations: [EventViewComponent],
  exports: [EventViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
  ]
})
export class EventViewModule { }
