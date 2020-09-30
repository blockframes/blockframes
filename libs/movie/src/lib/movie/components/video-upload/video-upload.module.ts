import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

// Modules
import { UploadModule } from '@blockframes/media/components/upload/upload.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Components 
import { MovieVideoUploadComponent } from './video-upload.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,

    // Material
    MatCardModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,

    // Modules
    UploadModule,
    ToLabelModule,
  ],
  declarations: [MovieVideoUploadComponent],
  exports: [MovieVideoUploadComponent]
})
export class MovieVideoUploadModule { }
