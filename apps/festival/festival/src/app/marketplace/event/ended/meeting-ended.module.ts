
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MeetingEndedComponent } from './meeting-ended.component';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';

@NgModule({
  declarations: [ MeetingEndedComponent ],
  imports: [
    CommonModule,
    DurationModule,

    RouterModule.forChild([{ path: '', component: MeetingEndedComponent }])
  ],
})
export class MeetingEndedModule {}
