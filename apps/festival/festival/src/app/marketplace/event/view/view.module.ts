import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventViewComponent } from './view.component';
import { RouterModule } from '@angular/router';
import { EventViewModule as EventViewLayoutModule } from '@blockframes/event/layout/view/view.module';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { GuestListModule } from '@blockframes/invitation/components/guest-list/guest-list.module';

@NgModule({
  declarations: [EventViewComponent],
  imports: [
    CommonModule,
    EventViewLayoutModule,
    EventRangeModule,
    MovieHeaderModule,
    GuestListModule,
    RouterModule.forChild([{ path: '', component: EventViewComponent }])
  ]
})
export class EventViewModule { }
