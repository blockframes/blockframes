
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';

import { MeetingEndedComponent } from './meeting-ended.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';
import { EventLayoutModule } from '@blockframes/ui/layout/event/event.module';

@NgModule({
  declarations: [ MeetingEndedComponent ],
  imports: [
    CommonModule,
    DurationModule,
    EventRangeModule,
    ImageModule,
    ToLabelModule,
    DisplayNameModule,
    EventLayoutModule,
    RouterModule.forChild([{ path: '', component: MeetingEndedComponent }])
  ],
})
export class MeetingEndedModule {}
