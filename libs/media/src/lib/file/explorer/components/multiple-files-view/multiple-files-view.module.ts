import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

import { MultipleFilesViewComponent } from './multiple-files-view.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ToArrayPipeModule } from '@blockframes/utils/pipes/to-array.pipe';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { FilePreviewDialogModule } from '../../../preview-dialog/preview-dialog.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [MultipleFilesViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    TableFilterModule,
    ToArrayPipeModule,
    FileNameModule,
    DeepKeyPipeModule,
    FilePreviewDialogModule,
    ConfirmModule,

    // Material
    MatButtonModule,
    MatIconModule
  ],
  exports: [MultipleFilesViewComponent],
})
export class MultipleFilesViewModule { }
