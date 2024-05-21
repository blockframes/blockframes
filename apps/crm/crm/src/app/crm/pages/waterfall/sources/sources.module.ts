import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RightExistsPipe, SourcesComponent } from './sources.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version/version-selector/version-selector.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [SourcesComponent, RightExistsPipe],
  imports: [
    CommonModule,

    TableModule,
    ToGroupLabelPipeModule,
    MaxLengthModule,
    JoinPipeModule,
    VersionSelectorModule,

    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,

    // remove
    RouterModule.forChild([{ path: '', component: SourcesComponent }])
  ]
})
export class SourcesModule { }
