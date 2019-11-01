import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogProductionInformationsComponent } from './production-informations.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
@NgModule({
  declarations: [CatalogProductionInformationsComponent],
  imports: [CommonModule, FlexLayoutModule],
  exports: [CatalogProductionInformationsComponent]
})
export class CatalogProductionInformationsModule {}
