import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RightExistsPipe, SourcesComponent } from './sources.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version/version-selector/version-selector.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

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
