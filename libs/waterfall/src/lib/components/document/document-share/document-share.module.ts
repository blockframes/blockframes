import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DocumentShareComponent } from './document-share.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [DocumentShareComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    
    // Blockframes
    GlobalModalModule,
    ImageModule,

    // Material
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  exports: [DocumentShareComponent]
})
export class DocumentShareModule { }
