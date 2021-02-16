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
<<<<<<< HEAD
import { FileNameModule } from '@blockframes/utils/pipes';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';

// File explorer
import { FileExplorerListComponent } from './list/list.component';
=======

// File explorer
import { MultipleFilesViewModule } from './multiple-files-view/multiple-files-view.module';
>>>>>>> a6d357c74bfd24eb036234f9d27702e31c353d3b
import { FileExplorerFileComponent } from './file/file.component';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    GetDirPipe,
    FileExplorerComponent,
    FileExplorerFileComponent,
    FileExplorerListComponent,
  ],
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
    FileNameModule,
    FormListModule,

    // Material
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDialogModule
  ],
  exports: [FileExplorerComponent]
})
export class FileExplorerModule { }
