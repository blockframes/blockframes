import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SelectionMapComponent } from './selection-map.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [SelectionMapComponent],
  exports: [SelectionMapComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    HttpClientModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class DistributionDealSelectionMapModule { }
