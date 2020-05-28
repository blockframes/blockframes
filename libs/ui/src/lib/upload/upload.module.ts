import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ButtonUploadComponent } from './button-upload/button-upload.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgAssetModule } from '@blockframes/ui/theme';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatButtonModule,
    MatTooltipModule,
    ImgAssetModule
  ],
  declarations: [
    FileUploadComponent,
    ButtonUploadComponent
  ],
  exports: [
    FileUploadComponent,
    ButtonUploadComponent
  ]
})
export class UploadModule { }
