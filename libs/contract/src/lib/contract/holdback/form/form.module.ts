import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LanguagesFormModule } from "@blockframes/movie/form/languages/languages.module";
import { MaxLengthModule } from '@blockframes/utils/pipes';

import { HoldbackListModule } from '../list/list.module';
import { SelectionModalModule } from '../selection-modal/selection-modal.module';
import { HolbackFormComponent } from './form.component';

import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [HolbackFormComponent],
  exports: [HolbackFormComponent],
  imports: [
    CommonModule,
    LanguagesFormModule,
    HoldbackListModule,
    MatDialogModule,
    FlexLayoutModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    SelectionModalModule,
    MaxLengthModule,
    ReactiveFormsModule
  ]
})
export class HoldbackFormModule { }
