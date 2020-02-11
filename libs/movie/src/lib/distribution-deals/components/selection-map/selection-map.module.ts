import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SelectionMapComponent } from './selection-map.component';

import { MapModule } from '@blockframes/ui/map';

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
    MapModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class DistributionDealSelectionMapModule { }
