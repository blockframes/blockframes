import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MovieFormSalesCastComponent } from './sales-cast.component';

@NgModule({
  declarations: [MovieFormSalesCastComponent],
  imports: [
      CommonModule,
      ReactiveFormsModule,
      FlexLayoutModule,
    ],
  exports: [MovieFormSalesCastComponent],
})
export class MovieFormSalesCastModule { }