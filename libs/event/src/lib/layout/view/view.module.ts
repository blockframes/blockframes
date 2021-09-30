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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { CountdownModule } from '@blockframes/ui/countdown/countdown.module';

@NgModule({
  declarations: [EventViewComponent],
  exports: [EventViewComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    EventRangeModule,
    EventTimeModule,
    ImageModule,
    InvitationActionModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CountdownModule
  ]
})
export class EventViewModule { }
