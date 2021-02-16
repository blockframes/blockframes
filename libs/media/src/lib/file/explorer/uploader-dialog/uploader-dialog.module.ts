import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileNewUploaderModule } from '@blockframes/media/file/file-new-uploader/file-uploader.module';
import { FormDisplayNameModule } from '@blockframes/ui/form/display-name/display-name.module';

import { FileExplorerUploaderDialogComponent } from './uploader-dialog.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [FileExplorerUploaderDialogComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    FileNewUploaderModule,
    FormDisplayNameModule,

    // Material
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule
  ],
})
export class FileExplorerUploaderDialogModule { }
