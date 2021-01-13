import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileExplorerComponent } from './explorer.component';

// Blockframes
import { FileExplorerUploaderDialogModule } from './components/uploader-dialog/uploader-dialog.module';
import { FileExplorerCropperDialogModule } from './components/cropper-dialog/cropper-dialog.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';

// File explorer
import { MultipleFilesViewModule } from './components/multiple-files-view/multiple-files-view.module';
import { SingleFileViewModule } from './components/single-file-view/single-file-view.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [FileExplorerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Blockframes
    FileExplorerUploaderDialogModule,
    FileExplorerCropperDialogModule,
    TableFilterModule,
    MaxLengthModule,
    OrgNameModule,

    // File explorer
    MultipleFilesViewModule,
    SingleFileViewModule,

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
