import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';
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
    ImageUploaderModule,
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
