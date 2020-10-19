import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileExplorerComponent } from './file-explorer.component';

// Blockframes
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { AddFileDialogModule } from '@blockframes/media/components/dialog/add-file.module';
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [FileExplorerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    TableFilterModule,
    ImageReferenceModule,
    FileNameModule,
    AddFileDialogModule,
    MaxLengthModule,
    DeepKeyPipeModule,
    ConfirmModule,
    OrgNameModule,

    // Material
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [FileExplorerComponent]
})
export class FileExplorerModule { }
