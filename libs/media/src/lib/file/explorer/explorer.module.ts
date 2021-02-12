import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileExplorerComponent, GetDirPipe } from './explorer.component';

// Blockframes
import { FileExplorerUploaderDialogModule } from './uploader-dialog/uploader-dialog.module';
import { FileExplorerCropperDialogModule } from './cropper-dialog/cropper-dialog.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { FileNewUploaderModule } from '../file-new-uploader/file-uploader.module';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';

// File explorer
import { MultipleFilesViewModule } from './multiple-files-view/multiple-files-view.module';
import { FileExplorerFileComponent } from './file/file.component';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [FileExplorerComponent, GetDirPipe, FileExplorerFileComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Blockframes
    FileExplorerUploaderDialogModule,
    FileExplorerCropperDialogModule,
    TableFilterModule,
    MaxLengthModule,
    OrgNameModule,
    FileNewUploaderModule,
    ImageUploaderModule,
    // File explorer
    MultipleFilesViewModule,

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
