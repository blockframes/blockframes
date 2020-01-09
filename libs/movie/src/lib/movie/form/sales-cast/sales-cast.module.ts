import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MovieFormSalesCastComponent } from './sales-cast.component';
// Material
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [MovieFormSalesCastComponent],
  imports: [
      CommonModule,
      ReactiveFormsModule,
      FlexLayoutModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule
    ],
  exports: [MovieFormSalesCastComponent],
})
export class MovieFormSalesCastModule { }