import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ButtonUploadComponent } from './button-upload/button-upload.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule, MatButtonModule],
  declarations: [FileUploadComponent, ButtonUploadComponent],
  exports: [FileUploadComponent, ButtonUploadComponent]
})
export class UploadModule {}
