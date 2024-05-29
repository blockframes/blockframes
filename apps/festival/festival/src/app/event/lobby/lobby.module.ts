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
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';

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
