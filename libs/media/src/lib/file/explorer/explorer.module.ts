import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileExplorerComponent, GetDirPipe } from './explorer.component';

// Blockframes
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { FileUploaderModule } from '../file-uploader/file-uploader.module';
import { ImageUploaderModule } from '../../image/uploader/uploader.module';
import { FileNameModule } from '@blockframes/utils/pipes';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { OpenPreviewModule } from '@blockframes/ui/open-preview/open-preview.module'
import { FilePreviewModule } from '../preview/preview.module';
import { FileListUploaderModule } from '../file-list-uploader/file-list-uploader.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    GetDirPipe,
    FileExplorerComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Blockframes
    MaxLengthModule,
    FileUploaderModule,
    ImageUploaderModule,
    FileNameModule,
    FormListModule,
    FilePreviewModule,
    FileListUploaderModule,
    OpenPreviewModule,

    // Material
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatCheckboxModule
  ],
  exports: [FileExplorerComponent]
})
export class FileExplorerModule { }
