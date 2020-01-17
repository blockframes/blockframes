// Angular
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CertificationsComponent } from './certifications.component';

// Material
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [CertificationsComponent],
  exports: [CertificationsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Material
    MatButtonToggleModule,
  ],
})
export class MovieFormCertificationsModule {}
