import { NgModule } from '@angular/core';
import {
  StandardTermsComponent,
} from './standard-terms.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PdfViewerModule } from '@blockframes/media/pdf/viewer/viewer.module'

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';



@NgModule({
  declarations: [
    StandardTermsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: StandardTermsComponent }]),
    PdfViewerModule,

    MatButtonModule,
    MatIconModule,
  ],
  exports: [
    StandardTermsComponent,
  ],
})
export class StandardTermsModule { }
