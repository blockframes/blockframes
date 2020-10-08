import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {FlexModule} from "@angular/flex-layout";

import {ParticipantsNavComponent} from "@blockframes/event/components/meeting/participant-nav/participants-nav.component";
import {ImageReferenceModule} from '@blockframes/media/directives/image-reference/image-reference.module';

import {EventInitialParticipantModule} from "@blockframes/event/pipes/event-initial-participant.pipe";
import {DisplayNameModule} from '@blockframes/utils/pipes';
import {ContainerVideoComponent} from "@blockframes/event/components/meeting/container-video/container-video.component";


@NgModule({
  declarations: [
    ParticipantsNavComponent,
    ContainerVideoComponent,
  ],
  exports: [
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
