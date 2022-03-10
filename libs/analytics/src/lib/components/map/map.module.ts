import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AnalyticsMapComponent } from './map.component';

import { MapModule } from '@blockframes/ui/map';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    ToLabelModule,
    MapModule,

    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  declarations: [AnalyticsMapComponent],
  exports: [AnalyticsMapComponent]
})
export class AnalyticsMapModule {}