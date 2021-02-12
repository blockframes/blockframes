import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Components
import { MoviePictureUploadComponent } from './picture-upload.component';
import { ImageNewUploaderModule } from '@blockframes/media/image/uploader-new/uploader.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,
    ImageNewUploaderModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [MoviePictureUploadComponent],
  exports: [MoviePictureUploadComponent]
})
export class MoviePictureUploadModule { }
