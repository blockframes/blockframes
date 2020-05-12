import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventViewComponent } from './view.component';
import { RouterModule } from '@angular/router';
import { EventViewModule as EventViewLayoutModule } from '@blockframes/event/layout/view/view.module';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';


@NgModule({
  declarations: [EventViewComponent],
  imports: [
    CommonModule,
    EventViewLayoutModule,
    EventTimeModule,
    EventRangeModule,
    RouterModule.forChild([{ path: '', component: EventViewComponent }])
  ]
})
export class EventViewModule { }
