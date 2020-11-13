import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { LobbyComponent } from './lobby.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MeetingVideoModule } from '@blockframes/event/components/meeting/video/video.module';


@NgModule({
  declarations: [LobbyComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    ImageReferenceModule,
    MeetingVideoModule,

    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,

    RouterModule.forChild([{ path: '', component: LobbyComponent }])
  ]
})
export class LobbyModule { }
