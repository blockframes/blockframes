import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MovieFormSalesInfoComponent } from './sales-info.component';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  declarations: [MovieFormSalesInfoComponent],
  exports: [MovieFormSalesInfoComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Libraries
    NgxMatSelectSearchModule,

    // Material
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class MovieFormSalesInfoModule {}
