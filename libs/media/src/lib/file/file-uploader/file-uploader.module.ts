import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from './file-uploader.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageModule } from '../../image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
