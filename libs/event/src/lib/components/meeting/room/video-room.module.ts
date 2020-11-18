
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MeetingVideoModule } from '../video/video.module';
import { MeetingVideoRoomComponent } from './video-room.component';

@NgModule({
  declarations: [ MeetingVideoRoomComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,

    MeetingVideoModule,
  ],
  exports: [ MeetingVideoRoomComponent ],
})
export class MeetingVideoRoomModule { }
