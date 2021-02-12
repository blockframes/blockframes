import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';

import { SingleFileViewComponent } from './single-file-view.component';

import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';
import { FileNewUploaderModule } from '../../file-new-uploader/file-uploader.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SingleFileViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageUploaderModule,
    FileNewUploaderModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [SingleFileViewComponent],
})
export class SingleFileViewModule { }
