import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventViewComponent } from './view.component';
import { RouterModule } from '@angular/router';
import { GuestListModule } from '@blockframes/invitation/components/guest-list/guest-list.module';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';


@NgModule({
  declarations: [EventViewComponent],
  imports: [
    CommonModule,
    EventRangeModule,
    GuestListModule,
    RouterModule.forChild([{ path: '', component: EventViewComponent }])
  ]
})
export class EventViewModule { }
