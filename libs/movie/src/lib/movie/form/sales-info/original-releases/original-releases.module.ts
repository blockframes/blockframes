import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OriginalReleaseComponent } from './original-releases.component';

import { MovieFormOriginCountryModule } from '../../main/origin-country/origin-country.module';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [OriginalReleaseComponent],
  exports: [OriginalReleaseComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MovieFormOriginCountryModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class MovieFormOriginalReleasesModule { }
