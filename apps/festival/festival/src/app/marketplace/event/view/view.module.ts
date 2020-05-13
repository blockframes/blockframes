import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { EventViewComponent } from './view.component';

import { EventViewModule as EventViewLayoutModule } from '@blockframes/event/layout/view/view.module';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { GuestListModule } from '@blockframes/invitation/components/guest-list/guest-list.module';
import { ImageReferenceModule } from '@blockframes/ui/media';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { DisplayNameModule } from '@blockframes/utils/pipes';

@NgModule({
  declarations: [EventViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EventViewLayoutModule,
    EventRangeModule,
    MovieHeaderModule,
    GuestListModule,
    ImageReferenceModule,
    OrgNameModule,
    DisplayNameModule,
    RouterModule.forChild([{ path: '', component: EventViewComponent }])
  ]
})
export class EventViewModule { }
