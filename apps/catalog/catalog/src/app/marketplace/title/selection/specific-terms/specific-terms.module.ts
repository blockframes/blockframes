import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { SpecificTermsComponent } from './specific-terms.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ImageModule,

    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  exports: [SpecificTermsComponent],
  declarations: [SpecificTermsComponent]
})
export class SpecificTermsComponentModule { }
