import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {VideoComponent} from './video/video.component';
import {FlexModule} from "@angular/flex-layout";

import {ParticipantsNavComponent} from "@blockframes/event/components/meeting/participant-nav/participants-nav.component";
import {ControlVideoComponent} from "@blockframes/event/components/meeting/control-media/video/video.component";
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

import {LocalComponent} from './participant/local/local.component';
import {RemoteComponent} from './participant/remote/remote.component';
import {DominantSpeakerComponent} from './participant/dominant-speaker/dominant-speaker.component';
import {ContainerVideoComponent} from './container-video/container-video.component';
import {ControlAudioComponent} from './control-media/audio/audio.component';
import {EventInitialParticipantModule} from "@blockframes/event/pipes/event-initial-participant.pipe";


@NgModule({
  declarations: [
    VideoComponent,
    LocalComponent,
    RemoteComponent,
    DominantSpeakerComponent,
    ParticipantsNavComponent,
    ContainerVideoComponent,
    ControlAudioComponent,
    ControlVideoComponent
  ],
  exports: [
    VideoComponent,
    ContainerVideoComponent,
    ControlAudioComponent,
    ControlVideoComponent
  ],
    imports: [
      MatButtonModule,
      MatIconModule,
      MatSidenavModule,
      MatListModule,
      CommonModule,
      MatGridListModule,
      FlexModule,
      EventInitialParticipantModule,
      ImageReferenceModule
    ]
})
export class MeetingModule { }
