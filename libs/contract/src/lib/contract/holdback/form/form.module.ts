import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HolbackFormComponent } from './form.component';

import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { StaticGroupModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { JoinPipeModule, ToGroupLabelPipeModule, ToLabelModule, VersionPipeModule } from '@blockframes/utils/pipes';
import { LanguagesFormModule } from "@blockframes/movie/form/languages/languages.module";

import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    HolbackFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormTableModule,
    StaticGroupModule,
    ToGroupLabelPipeModule,
    ToLabelModule,
    JoinPipeModule,
    VersionPipeModule,
    LanguagesFormModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class HoldbackFormModule { }
