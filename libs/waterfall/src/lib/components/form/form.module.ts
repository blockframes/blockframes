// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';

// Blockframes
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';

// Pages
import { FormComponent } from './form.component';


@NgModule({
  declarations: [FormComponent],
  exports: [FormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageUploaderModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    MatFormFieldModule,
  ],
})
export class FormModule { }
