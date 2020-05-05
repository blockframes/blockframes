import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventCalendarComponent } from './calendar.component';

import { EventModule } from '@blockframes/event/event.module';
import { EventCardModule } from '@blockframes/event/components/card/card.module';
import { EventLinkModule } from '@blockframes/event/pipes/event-link.pipe';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.module'

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [EventCalendarComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EventModule,
    EventCardModule,
    EventLinkModule,
    AppBarModule,
    DisplayNameModule,
    // Material
    MatIconModule,
    MatButtonModule,
    // Router
    RouterModule.forChild([{ path: '', component: EventCalendarComponent }])
  ]
})
export class EventCalendarModule { }
