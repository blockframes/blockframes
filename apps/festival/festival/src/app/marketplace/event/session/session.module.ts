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
import { EventPlayerModule } from '@blockframes/event/components/player/player.module';
import { MeetingMediaListModule } from '@blockframes/event/components/meeting/media-list/media-list.module';

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import {MeetingModule} from "@blockframes/event/components/meeting/meeting.module";


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
    EventPlayerModule,
    MeetingMediaListModule,
    MeetingModule,
    FileNameModule,
    MediaControlModule,
    MediaViewerModule,

    // Materials
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: SessionComponent }])
  ]
})
export class SessionModule { }
