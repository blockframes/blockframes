import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileExplorerComponent, GetDirPipe } from './explorer.component';

// Blockframes
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { FileUploaderModule } from '../file-uploader/file-uploader.module';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';
import { FileNameModule } from '@blockframes/utils/pipes';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { OpenPreviewModule } from '@blockframes/ui/open-preview/open-preview.module'
import { FilePreviewModule } from '../preview/preview.module';
import { FileListUploaderModule } from '../file-list-uploader/file-list-uploader.module';

// Material
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';

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
