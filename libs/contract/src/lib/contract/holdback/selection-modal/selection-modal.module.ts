import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

import { HoldbackListModule } from '../list/list.module';
import { SelectionModalComponent } from './selection-modal.component';

import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, ToLabelModule, VersionPipeModule } from '@blockframes/utils/pipes';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';

@NgModule({
  imports: [
    CommonModule,
    FormTableModule,
    HoldbackListModule,
    GlobalModalModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    JoinPipeModule,
    MaxLengthModule,
    ToGroupLabelPipeModule,
    ToLabelModule,
    VersionPipeModule,
    GroupMultiselectModule,
  ],
  exports: [SelectionModalComponent],
  declarations: [SelectionModalComponent]
})
export class SelectionModalModule { }
