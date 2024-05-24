import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MeetingVideoModule } from '@blockframes/event/components/meeting/video/video.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

// Components
import { LobbyComponent } from './lobby.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [LobbyComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    ImageModule,
    MeetingVideoModule,
    ToLabelModule,
    LogoSpinnerModule,

    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ConfirmModule,
    RouterModule.forChild([{ path: '', component: LobbyComponent }])
  ]
})
export class LobbyModule { }
