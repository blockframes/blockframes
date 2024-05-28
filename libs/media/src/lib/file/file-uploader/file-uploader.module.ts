import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from './file-uploader.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageModule } from '../../image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileNameModule } from '@blockframes/utils/pipes';
import { DownloadPipeModule } from '../pipes/download.pipe';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatButtonModule,
    MatTooltipModule,
    ImageModule,
    FileNameModule,
    DownloadPipeModule,
  ],
  declarations: [
    FileUploaderComponent
  ],
  exports: [
    FileUploaderComponent
  ]
})
export class FileUploaderModule { }
