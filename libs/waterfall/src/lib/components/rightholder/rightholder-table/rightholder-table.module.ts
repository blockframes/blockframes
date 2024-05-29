// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { VersionNamePipeModule } from '../../../pipes/version-name.pipe';

// Component
import { RightholderTableComponent } from './rightholder-table.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [RightholderTableComponent],
  imports: [
    CommonModule,

    TableModule,
    ToLabelModule,
    VersionNamePipeModule,

    // Material
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,

    // Routing
    RouterModule,
  ],
  exports: [RightholderTableComponent]
})
export class RightholderTableModule { }
