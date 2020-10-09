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
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import {EventInitialParticipantModule} from "@blockframes/event/pipes/event-initial-participant.pipe";
import { DisplayNameModule } from '@blockframes/utils/pipes';

// Components
import {VideoComponent} from './video/video.component';
import {RemoteComponent} from './participant/remote/remote.component';
import {ContainerVideoComponent} from './container-video/container-video.component';
import { AvatarInitialComponent } from './avatar-initial/avatar-initial.component';


@NgModule({
  declarations: [
    VideoComponent,
    RemoteComponent,
    ContainerVideoComponent,
    AvatarInitialComponent
  ],
  exports: [
    VideoComponent,
    ContainerVideoComponent,
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
      DisplayNameModule,
      ImageReferenceModule
    ]
})
export class MeetingModule { }

