
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FileNameModule } from '@blockframes/utils/pipes';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';

import { OpenPreviewModule } from '@blockframes/ui/open-preview/open-preview.module'

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
    OpenPreviewModule,
  ],
  declarations: [ FileListUploaderComponent ],
  exports: [ FileListUploaderComponent ],
})
export class FileListUploaderModule {}
