import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { ImgAssetModule } from '@blockframes/ui/theme';
import { SessionComponent } from './session.component';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { DisplayNameModule } from "@blockframes/utils/pipes/display-name.module";
import { EventCounterModule } from "@blockframes/event/pipes/event-counter.pipe";
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { EventPlayerModule } from '@blockframes/event/components/player/player.module';

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [SessionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Components
    ImgAssetModule,
    ImageReferenceModule,
    DisplayNameModule,
    EventCounterModule,
    EventTimeModule,
    OrgNameModule,
    EventPlayerModule,
    // Materials
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: SessionComponent }])
  ]
})
export class SessionModule { }
