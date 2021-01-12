import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { SessionComponent } from './session.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MediaControlModule } from '@blockframes/media/components/controls/media-control.module';
import { MediaViewerModule } from '@blockframes/media/components/viewers/media-viewer.module';
import { DisplayNameModule } from "@blockframes/utils/pipes/display-name.pipe";
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { MediaPlayerModule } from '@blockframes/media/components/player/player.module';
import { MeetingMediaListModule } from '@blockframes/event/components/meeting/media-list/media-list.module';
import { MeetingVideoRoomModule } from '@blockframes/event/components/meeting/room/video-room.module';
import { DoorbellBottomSheetModule } from '@blockframes/event/components/doorbell/doorbell.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

@NgModule({
  declarations: [SessionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Components
    ImageReferenceModule,
    DisplayNameModule,
    EventTimeModule,
    OrgNameModule,
    MediaPlayerModule,
    MeetingMediaListModule,
    FileNameModule,
    MediaControlModule,
    MediaViewerModule,
    MeetingVideoRoomModule,
    DoorbellBottomSheetModule,
    ConfirmModule,

    // Materials
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: SessionComponent }])
  ]
})
export class SessionModule { }
