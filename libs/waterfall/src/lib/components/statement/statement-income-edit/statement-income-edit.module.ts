import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { StatementIncomeEditComponent } from './statement-income-edit.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [StatementIncomeEditComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GlobalModalModule,
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
  ],
  exports: [StatementIncomeEditComponent]
})
export class StatementIncomeEditModule { }
