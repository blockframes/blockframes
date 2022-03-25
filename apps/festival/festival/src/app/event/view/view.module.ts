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
import { AgendaExportModule } from '@blockframes/event/components/agenda-export/agenda-export.module';
import { RequestScreeningModule } from '@blockframes/event/components/request-screening/request-screening.module';
import { RequestAskingPriceModule } from '@blockframes/movie/components/request-asking-price/request-asking-price.module';
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';

import { MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';

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
    RequestScreeningModule,
    RequestAskingPriceModule,
    CarouselModule,
    MovieCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatLayoutModule,
    AgendaExportModule,
    RouterModule.forChild([{ path: '', component: EventViewComponent }])
  ]
})
export class EventViewModule { }
