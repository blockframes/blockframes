import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { GuestTableModule } from '../guest-table/guest-table.module';
import { MatIconModule } from '@angular/material/icon';

// Modules
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';
import { GoToModule } from '../go-to/go-to.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { AgendaExportModule } from '@blockframes/event/components/agenda-export/agenda-export.module';

// Components 
import { EventInfoComponent } from './event-info.component';

@NgModule({
  declarations: [EventInfoComponent],
  exports: [EventInfoComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    EventRangeModule,
    GuestTableModule,
    GoToModule,
    AgendaExportModule,
    ToLabelModule,

    // Material
    MatCardModule,
    MatIconModule
  ]
})
export class EventInfoModule { }
