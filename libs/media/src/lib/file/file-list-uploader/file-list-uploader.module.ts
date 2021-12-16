
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FileNameModule } from '@blockframes/utils/pipes';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { PreviewModalModule } from '@blockframes/ui/preview-modal/preview.module'

import { FileUploaderModule } from '../file-uploader/file-uploader.module';

import { FileListUploaderComponent } from './file-list-uploader.component';



@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatCheckboxModule,

    FileNameModule,
    FileUploaderModule,
    PreviewModalModule,
  ],
  declarations: [ FileListUploaderComponent ],
  exports: [ FileListUploaderComponent ],
})
export class FileListUploaderModule {}
