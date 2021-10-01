import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { EventViewComponent } from './view.component';

import { EventViewModule as EventViewLayoutModule } from '@blockframes/event/layout/view/view.module';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrganizationCardModule } from '@blockframes/organization/components/card/card.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { DisplayNameModule, DisplayPositionModule } from '@blockframes/utils/pipes';
import { MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [EventViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EventViewLayoutModule,
    EventRangeModule,
    MovieHeaderModule,
    ImageModule,
    OrgNameModule,
    OrgChipModule,
    OrganizationCardModule,
    DisplayNameModule,
    DisplayPositionModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: EventViewComponent }])
  ]
})
export class EventViewModule { }
