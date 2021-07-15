import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HolbackFormComponent } from './form.component';

import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { StaticGroupModule } from '@blockframes/ui/static-autocomplete/group/group.module';
@NgModule({
  declarations: [
    HolbackFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormTableModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    StaticGroupModule,
  ]
})
export class FormModule { }
