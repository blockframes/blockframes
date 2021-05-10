import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DetailedTermsComponent } from './detailed.component';
import { ToLabelModule } from '@blockframes/utils/pipes';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    ToLabelModule,

    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
  ],
  exports: [DetailedTermsComponent],
  declarations: [DetailedTermsComponent]
})
export class DetailedTermsModule { }
