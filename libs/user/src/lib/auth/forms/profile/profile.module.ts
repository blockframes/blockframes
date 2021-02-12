import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageNewUploaderModule } from '@blockframes/media/image/uploader-new/uploader.module';
import { ReactiveFormsModule } from '@angular/forms';

import { ProfileFormComponent } from './profile.component';

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
    ImageNewUploaderModule,
    ReactiveFormsModule,

    // Material
    MatCardModule,
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule
  ],
  exports: [ProfileFormComponent]
})
export class ProfileFormModule { }
