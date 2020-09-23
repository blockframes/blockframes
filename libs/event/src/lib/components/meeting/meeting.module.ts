import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoComponent } from './video/video.component';
import { ParticipantComponent } from './participant/participant.component';
import { LocalParticipantComponent } from './local-participant/local-participant.component';



@NgModule({
  declarations: [VideoComponent, ParticipantComponent, LocalParticipantComponent],
  exports: [VideoComponent],
  imports: [
    CommonModule
  ]
})
export class MeetingModule { }
