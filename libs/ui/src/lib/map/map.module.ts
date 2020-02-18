import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MapComponent, MapFeature } from './map.component';



@NgModule({
  declarations: [MapComponent, MapFeature],
  exports: [MapComponent, MapFeature],
  imports: [
    CommonModule,
    HttpClientModule,
  ]
})
export class MapModule { }
