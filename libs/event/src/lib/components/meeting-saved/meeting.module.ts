import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VideoComponentSaved} from './video/video.component';
import {LocalComponentSaved} from './participant/local/local.component';
import {RemoteComponentSaved} from './participant/remote/remote.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {DominantSpeakerComponentSaved} from './participant/dominant-speaker/dominant-speaker.component';
import {FlexModule} from "@angular/flex-layout";
import {MatSidenavModule} from "@angular/material/sidenav";
import {ContainerVideoComponentSaved} from './container-video/container-video.component';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {ControlAudioComponentSaved} from './control-media/audio/audio.component';
import {ParticipantsNavComponentSaved} from "@blockframes/event/components/meeting-saved/participant-nav/participants-nav.component";
import {ControlVideoComponentSaved} from "@blockframes/event/components/meeting-saved/control-media/video/video.component";


@NgModule({
  declarations: [
    VideoComponentSaved,
    LocalComponentSaved,
    RemoteComponentSaved,
    DominantSpeakerComponentSaved,
    ParticipantsNavComponentSaved,
    ContainerVideoComponentSaved,
    ControlAudioComponentSaved,
    ControlVideoComponentSaved
  ],
  exports: [
    VideoComponentSaved,
    ContainerVideoComponentSaved,
    ControlAudioComponentSaved,
    ControlVideoComponentSaved
  ],
    imports: [
      MatButtonModule,
      MatIconModule,
      MatSidenavModule,
      CommonModule,
      MatGridListModule,
      FlexModule,
    ]
})
export class MeetingSavedModule { }
