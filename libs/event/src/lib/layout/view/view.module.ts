import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventViewComponent } from './view.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { InvitationActionModule } from '@blockframes/invitation/components/action/action.module';
import { EventRangeModule } from '../../pipes/event-range.pipe';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImageReferenceModule } from '@blockframes/ui/media';

@NgModule({
  declarations: [EventViewComponent],
  exports: [EventViewComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    EventRangeModule,
    EventTimeModule,
    ImageReferenceModule,
    InvitationActionModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class EventViewModule { }
