import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';

import { SingleFileViewComponent } from './single-file-view.component';

import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SingleFileViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    CropperModule,
    FileUploaderModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [SingleFileViewComponent],
})
export class SingleFileViewModule { }
