import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileExplorerComponent, GetDirPipe } from './explorer.component';

// Blockframes
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { FileUploaderModule } from '../file-uploader/file-uploader.module';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';
import { FileNameModule } from '@blockframes/utils/pipes';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { PreviewModalModule } from '@blockframes/ui/preview-modal/preview.module'

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { FilePreviewModule } from '../preview/preview.module';
import { FileListUploaderModule } from '../file-list-uploader/file-list-uploader.module';

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
    OrgNameModule,
    FileUploaderModule,
    ImageUploaderModule,
    FileNameModule,
    FormListModule,
    FilePreviewModule,
    FileListUploaderModule,
    PreviewModalModule,

    // Material
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  exports: [FileExplorerComponent]
})
export class FileExplorerModule { }
