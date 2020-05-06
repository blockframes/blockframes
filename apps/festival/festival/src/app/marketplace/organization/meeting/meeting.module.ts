import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MeetingComponent } from './meeting.component';

import { EventModule } from '@blockframes/event/event.module';
import { EventCardModule } from '@blockframes/event/components/card/card.module';
import { EventLinkModule } from '@blockframes/event/pipes/event-link.pipe';
import { AppBarModule } from '@blockframes/ui/app-bar';


@NgModule({
  declarations: [MeetingComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EventModule,
    EventCardModule,
    EventLinkModule,
    AppBarModule,
    // Router
    RouterModule.forChild([{ path: '', component: MeetingComponent }])
  ]
})
export class MeetingModule { }
