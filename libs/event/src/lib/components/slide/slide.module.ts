import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

import { EventSlideComponent } from "./slide.component";
import { OngoingButtonModule } from '@blockframes/ui/ongoing-button/ongoing-button.module';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { EventRangeModule } from "@blockframes/event/pipes/event-range.pipe";
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { InvitationActionModule } from '@blockframes/invitation/components/action/action.module';

import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    OngoingButtonModule,
    EventTimeModule,
    GetTitlePipeModule,
    ImageModule,
    EventRangeModule,
    GetOrgPipeModule,
    OrgChipModule,
    InvitationActionModule,

    MatButtonModule
  ],
  declarations: [EventSlideComponent],
  exports: [EventSlideComponent]
})
export class EventSlideModule {}