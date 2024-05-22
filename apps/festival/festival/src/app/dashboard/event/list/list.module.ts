import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { EventLinkModule } from '@blockframes/event/pipes/event-link.pipe';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { EventListComponent } from './list.component';

import { EventModule } from '@blockframes/event/event.module';
import { EventCardModule } from '@blockframes/event/components/card/card.module';

import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [EventListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    EventModule,
    ImageModule,
    DisplayNameModule,
    EventLinkModule,
    EventCardModule,
    AppBarModule,
    // Material
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: EventListComponent }])
  ]
})
export class EventListModule { }
