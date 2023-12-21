import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { StatementArbitraryChangeComponent } from './statement-arbitrary-change.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [StatementArbitraryChangeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GlobalModalModule,
    ToLabelModule,
    ToGroupLabelPipeModule,
    MaxLengthModule,
    JoinPipeModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,

    RouterModule,
  ],
  exports: [StatementArbitraryChangeComponent]
})
export class StatementArbitraryChangeModule { }
