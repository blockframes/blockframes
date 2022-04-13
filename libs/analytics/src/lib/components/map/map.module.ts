import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AnalyticsMapComponent } from './map.component';
import { ImageModule } from "@blockframes/media/image/directives/image.module";

import { MapModule } from '@blockframes/ui/map';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip'; 


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    ToLabelModule,
    MapModule,
    ImageModule,

    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule
  ],
  declarations: [AnalyticsMapComponent],
  exports: [AnalyticsMapComponent]
})
export class AnalyticsMapModule { }
