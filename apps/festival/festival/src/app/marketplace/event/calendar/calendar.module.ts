import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventCalendarComponent, HideBadgePipe } from './calendar.component';

import { EventModule } from '@blockframes/event/event.module';
import { EventCardModule } from '@blockframes/event/components/card/card.module';
import { EventLinkModule } from '@blockframes/event/pipes/event-link.pipe';
import { AppBarModule } from '@blockframes/ui/app-bar';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [EventCalendarComponent, HideBadgePipe],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    EventModule,
    EventCardModule,
    EventLinkModule,
    AppBarModule,
    // Material
    MatFormFieldModule,
    MatSelectModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    // Router
    RouterModule.forChild([{ path: '', component: EventCalendarComponent }])
  ]
})
export class EventCalendarModule { }
