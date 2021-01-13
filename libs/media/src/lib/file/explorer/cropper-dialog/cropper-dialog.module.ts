import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { FileExplorerCropperDialogComponent } from './cropper-dialog.component';

// Blockframes
import { CropperModule } from '../../../components/cropper/cropper.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [FileExplorerCropperDialogComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Blockframes
    CropperModule,

    // Material
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule
  ],
})
export class FileExplorerCropperDialogModule { }
