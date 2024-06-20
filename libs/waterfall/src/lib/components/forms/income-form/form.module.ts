// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';

// Components
import { IncomeFormComponent } from './form.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [IncomeFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Blockframes
    FormTableModule,
    ToGroupLabelPipeModule,
    MaxLengthModule,
    JoinPipeModule,
    GroupMultiselectModule,

    // Material
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSelectModule,
  ],
  exports: [IncomeFormComponent]
})
export class IncomeFormModule { }
