
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MeetingVideoModule } from '../video/video.module';
import { MeetingVideoRoomComponent } from './video-room.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RoomPipe } from './room.pipe';

@NgModule({
  declarations: [ MeetingVideoRoomComponent, RoomPipe ],
  imports: [
    CommonModule,
    FlexLayoutModule,

    MeetingVideoModule,

    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [ MeetingVideoRoomComponent ],
})
export class MeetingVideoRoomModule { }
