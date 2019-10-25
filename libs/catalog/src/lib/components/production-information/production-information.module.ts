import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogProductionInformationComponent } from './production-information.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
@NgModule({
  declarations: [CatalogProductionInformationComponent],
  imports: [CommonModule, FlexLayoutModule],
  exports: [CatalogProductionInformationComponent]
})
export class CatalogProductionInformationModule {}
