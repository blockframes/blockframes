import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';
import { ReactiveFormsModule } from '@angular/forms';

import { ProfileFormComponent } from './profile.component';

import { ReferencePathModule } from '@blockframes/media/directives/media/reference-path.pipe';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [ProfileFormComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    CropperModule,
    ReactiveFormsModule,
    ReferencePathModule,
    // Material
    MatCardModule,
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule
  ],
  exports: [ProfileFormComponent]
})
export class ProfileFormModule { }
