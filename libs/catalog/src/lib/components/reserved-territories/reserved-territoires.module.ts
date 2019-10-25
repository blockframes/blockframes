import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { CatalogReservedTerritoriesComponent } from './reserved-territories.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [CatalogReservedTerritoriesComponent],
  imports: [CommonModule, FlexLayoutModule],
  exports: [CatalogReservedTerritoriesComponent]
})
export class CatalogReservedTerritoriesModule {}
