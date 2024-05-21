
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MeetingVideoModule } from '../video/video.module';
import { MeetingVideoRoomComponent } from './video-room.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
