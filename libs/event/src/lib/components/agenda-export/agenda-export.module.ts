import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { AgendaExportComponent } from './agenda-export.component';

// Modules
import { ExportToGoogleAgendaModule } from '@blockframes/event/pipes/export-to-google-agenda.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

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
