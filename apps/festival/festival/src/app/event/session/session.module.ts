import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { SessionComponent } from './session.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { FileControlsModule } from '@blockframes/media/file/controls/controls.module';
import { FileViewersModule } from '@blockframes/media/file/viewers/viewers.module';
import { DisplayNameModule } from "@blockframes/utils/pipes/display-name.pipe";
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';
import { VideoViewerModule } from '@blockframes/media/video/viewer/viewer.module';
import { FileCarouselModule } from '@blockframes/media/file/carousel/carousel.module';
import { MeetingVideoRoomModule } from '@blockframes/event/components/meeting/room/video-room.module';
import { DoorbellBottomSheetModule } from '@blockframes/event/components/doorbell/doorbell.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { RequestAskingPriceModule } from '@blockframes/movie/components/request-asking-price/request-asking-price.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [SessionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Components
    ImageModule,
    DisplayNameModule,
    EventTimeModule,
    VideoViewerModule,
    FileCarouselModule,
    FileNameModule,
    FileControlsModule,
    FileViewersModule,
    MeetingVideoRoomModule,
    DoorbellBottomSheetModule,
    ConfirmModule,
    RequestAskingPriceModule,
    LogoSpinnerModule,
    // Materials
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,

    RouterModule.forChild([{ path: '', component: SessionComponent }])
  ]
})
export class SessionModule { }
