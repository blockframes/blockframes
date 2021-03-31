import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DetailedTermsComponent } from './detailed.component';
import { ToLabelModule } from '@blockframes/utils/pipes';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 

@NgModule({
  imports: [
    CommonModule,
    ToLabelModule,

    MatButtonModule,
    MatIconModule
  ],
  exports: [DetailedTermsComponent],
  declarations: [DetailedTermsComponent]
})
export class DetailedTermsModule { }
