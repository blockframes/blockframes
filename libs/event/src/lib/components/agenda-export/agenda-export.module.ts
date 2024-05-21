import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { AgendaExportComponent } from './agenda-export.component';

// Modules
import { ExportToGoogleAgendaModule } from '@blockframes/event/pipes/export-to-google-agenda.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [AgendaExportComponent],
  exports: [AgendaExportComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    ExportToGoogleAgendaModule
  ]
})
export class AgendaExportModule { }
