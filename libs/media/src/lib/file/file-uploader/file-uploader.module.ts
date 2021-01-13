import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from './file-uploader.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '../../directives/image-reference/image-reference.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileNameModule } from '@blockframes/utils/pipes';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatButtonModule,
    MatTooltipModule,
    ImageReferenceModule,
    FileNameModule,
  ],
  declarations: [
    FileUploaderComponent
  ],
  exports: [
    FileUploaderComponent
  ]
})
export class FileUploaderModule { }
