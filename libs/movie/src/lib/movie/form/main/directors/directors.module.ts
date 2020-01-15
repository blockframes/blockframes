import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormDisplayNameModule } from '@blockframes/ui/form/display-name/display-name.module';

import { DirectorsComponent } from './directors.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [DirectorsComponent],
  exports: [DirectorsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormDisplayNameModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class MovieFormDirectorsModule { }
