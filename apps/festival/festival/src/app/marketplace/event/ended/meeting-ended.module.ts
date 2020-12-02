
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';

import { MeetingEndedComponent } from './meeting-ended.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  declarations: [ MeetingEndedComponent ],
  imports: [
    CommonModule,
    DurationModule,
    EventRangeModule,
    ImageReferenceModule,

    RouterModule.forChild([{ path: '', component: MeetingEndedComponent }])
  ],
})
export class MeetingEndedModule {}
