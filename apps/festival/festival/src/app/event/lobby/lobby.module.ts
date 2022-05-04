import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ToLabelModule } from '@blockframes/utils/pipes';

// Components
import { LobbyComponent } from './lobby.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MeetingVideoModule } from '@blockframes/event/components/meeting/video/video.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

@NgModule({
  declarations: [LobbyComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    ImageModule,
    MeetingVideoModule,
    ToLabelModule,

    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ConfirmModule,
    RouterModule.forChild([{ path: '', component: LobbyComponent }])
  ]
})
export class LobbyModule { }
