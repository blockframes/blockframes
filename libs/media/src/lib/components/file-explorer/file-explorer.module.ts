import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileExplorerComponent } from './file-explorer.component';

// Blockframes Components
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { CropperModule } from '../cropper/cropper.module';
import { FileDialogModule } from '@blockframes/media/components/dialog/file/file.module';
import { ImageDialogModule } from '@blockframes/media/components/dialog/image/image.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

// Blockframes Pipes
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { ToArrayPipeModule } from '@blockframes/utils/pipes/to-array.pipe';

// Blockframes Directives
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [FileExplorerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Components
    ConfirmModule,
    CropperModule,
    FileDialogModule,
    ImageDialogModule,
    TableFilterModule,

    // Pipes
    DeepKeyPipeModule,
    FileNameModule,
    MaxLengthModule,
    OrgNameModule,
    ToArrayPipeModule,

    // Directives
    ImageReferenceModule,

    // Material
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [FileExplorerComponent]
})
export class FileExplorerModule { }
