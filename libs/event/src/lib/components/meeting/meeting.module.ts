import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoComponent } from './video/video.component';
import { LocalComponent } from './participant/local/local.component';
import { RemoteComponent } from './participant/remote/remote.component';
import {MatGridListModule} from "@angular/material/grid-list";
import { DominantSpeakerComponent } from './participant/dominant-speaker/dominant-speaker.component';
import {FlexModule} from "@angular/flex-layout";
import {MatSidenavModule} from "@angular/material/sidenav";
import {ParticipantsNavComponent} from "@blockframes/event/components/meeting/participant-nav/participants-nav.component";
import { ContainerVideoComponent } from './container-video/container-video.component';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";



@NgModule({
  declarations: [VideoComponent, LocalComponent, RemoteComponent, DominantSpeakerComponent, ParticipantsNavComponent, ContainerVideoComponent],
  exports: [VideoComponent, ContainerVideoComponent],
    imports: [
      MatButtonModule,
      MatIconModule,
      MatSidenavModule,
      CommonModule,
      MatGridListModule,
      FlexModule,
    ]
})
export class MeetingModule { }
