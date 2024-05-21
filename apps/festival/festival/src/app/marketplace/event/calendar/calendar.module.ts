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
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';


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
