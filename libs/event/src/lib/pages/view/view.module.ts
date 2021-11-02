import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { EventViewComponent } from './view.component';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrganizationCardModule } from '@blockframes/organization/components/card/card.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { DisplayNameModule, DisplayPositionModule } from '@blockframes/utils/pipes';
import { CountdownModule } from '@blockframes/ui/countdown/countdown.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { InvitationActionModule } from '@blockframes/invitation/components/action/action.module';
import { EventLayoutModule } from '@blockframes/ui/layout/event/event.module';

import { MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [EventViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EventRangeModule,
    EventTimeModule,
    MovieHeaderModule,
    ImageModule,
    OrgNameModule,
    OrgChipModule,
    OrganizationCardModule,
    DisplayNameModule,
    DisplayPositionModule,
    InvitationActionModule,
    CountdownModule,
    ToLabelModule,
    EventLayoutModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: EventViewComponent }])
  ]
})
export class EventViewModule { }
