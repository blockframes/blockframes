import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { SessionComponent } from './session.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { FileControlsModule } from '@blockframes/media/file/controls/controls.module';
import { FileViewersModule } from '@blockframes/media/file/viewers/viewers.module';
import { DisplayNameModule } from "@blockframes/utils/pipes/display-name.pipe";
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { VideoViewerModule } from '@blockframes/media/video/viewer/viewer.module';
import { FileCarouselModule } from '@blockframes/media/file/carousel/carousel.module';
import { MeetingVideoRoomModule } from '@blockframes/event/components/meeting/room/video-room.module';
import { DoorbellBottomSheetModule } from '@blockframes/event/components/doorbell/doorbell.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [SessionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Components
    ImageModule,
    DisplayNameModule,
    EventTimeModule,
    OrgNameModule,
    VideoViewerModule,
    FileCarouselModule,
    FileNameModule,
    FileControlsModule,
    FileViewersModule,
    MeetingVideoRoomModule,
    DoorbellBottomSheetModule,
    ConfirmModule,

    // Materials
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,

    RouterModule.forChild([{ path: '', component: SessionComponent }])
  ]
})
export class SessionModule { }
