import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LanguagesFormModule } from "@blockframes/movie/form/languages/languages.module";
import { MaxLengthModule } from '@blockframes/utils/pipes';

import { HoldbackListModule } from '../list/list.module';
import { SelectionModalModule } from '../selection-modal/selection-modal.module';
import { HolbackFormComponent } from './form.component';

import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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
    MaxLengthModule
  ]
})
export class HoldbackFormModule { }
