import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CertificationsComponent } from './certifications/certifications.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [CertificationsComponent],
  exports: [CertificationsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonToggleModule,
  ]
})
export class MovieFormSalesInfoModule { }
