import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileExplorerComponent } from './file-explorer.component';

// Blockframes
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { FileDialogModule } from '@blockframes/media/components/dialog/file/file.module';
import { ImageDialogModule } from '@blockframes/media/components/dialog/image/image.module';
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

@NgModule({
  declarations: [FileExplorerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Blockframes
    ConfirmModule,
    FileDialogModule,
    ImageDialogModule,
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
    MatTooltipModule
  ],
  exports: [FileExplorerComponent]
})
export class FileExplorerModule { }
