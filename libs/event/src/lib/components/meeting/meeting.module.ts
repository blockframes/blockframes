// Angular
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {FlexModule} from "@angular/flex-layout";

// Blockframes
import {ImageReferenceModule} from '@blockframes/media/directives/image-reference/image-reference.module';
import {EventInitialsModule} from "@blockframes/event/pipes/event-initial-participant.pipe";
import {DisplayNameModule} from '@blockframes/utils/pipes';

// Components
import {VideoComponent} from "@blockframes/event/components/meeting/video/video.component";
import {LocalComponent} from "@blockframes/event/components/meeting/participant/local/local.component";
import {RemoteComponent} from "@blockframes/event/components/meeting/participant/remote/remote.component";
import {DominantSpeakerComponent} from "@blockframes/event/components/meeting/participant/dominant-speaker/dominant-speaker.component";
import {ParticipantsNavComponent} from "@blockframes/event/components/meeting/participant-nav/participants-nav.component";
import {ContainerVideoComponent} from "@blockframes/event/components/meeting/container-video/container-video.component";
import {ControlAudioComponent} from "@blockframes/event/components/meeting/control-media/audio/audio.component";
import {ControlVideoComponent} from "@blockframes/event/components/meeting/control-media/video/video.component";
import {AvatarInitialComponent} from "@blockframes/event/components/meeting/avatar-initial/avatar-initial.component";

@NgModule({
  declarations: [
    VideoComponent,
    LocalComponent,
    RemoteComponent,
    DominantSpeakerComponent,
    ParticipantsNavComponent,
    ContainerVideoComponent,
    ControlAudioComponent,
    ControlVideoComponent,
    AvatarInitialComponent
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
    EventInitialsModule,
    DisplayNameModule,
    ImageReferenceModule
  ]
})
export class MeetingModule {
}

