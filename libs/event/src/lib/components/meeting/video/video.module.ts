
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MeetingVideoComponent } from './video.component';

@NgModule({
  declarations: [MeetingVideoComponent],
  imports: [
    CommonModule,

    MatIconModule,
    MatButtonModule,
  ],
  exports: [MeetingVideoComponent],
})
export class MeetingVideoModule {}

