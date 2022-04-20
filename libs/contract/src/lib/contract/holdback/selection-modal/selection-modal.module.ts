import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';

import { HoldbackListModule } from '../list/list.module';
import { SelectionModalComponent } from './selection-modal.component';

import { GlobalModalModule } from '@blockframes/ui/modal/modal.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, ToLabelModule, VersionPipeModule } from '@blockframes/utils/pipes';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { StaticGroupModule } from '@blockframes/ui/static-autocomplete/group/group.module';

@NgModule({
  imports: [
    CommonModule,
    FormTableModule,
    HoldbackListModule,
    GlobalModalModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    JoinPipeModule,
    MaxLengthModule,
    ToGroupLabelPipeModule,
    ToLabelModule,
    VersionPipeModule,
    StaticGroupModule
  ],
  exports: [SelectionModalComponent],
  declarations: [SelectionModalComponent]
})
export class SelectionModalModule { }
