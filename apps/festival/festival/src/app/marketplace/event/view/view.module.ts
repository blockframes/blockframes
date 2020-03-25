import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventViewComponent } from './view.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [EventViewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: EventViewComponent }])
  ]
})
export class EventViewModule { }
