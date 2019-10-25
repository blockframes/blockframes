import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogPromotionalElementsComponent } from './promotional-elements.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
@NgModule({
  declarations: [CatalogPromotionalElementsComponent],
  imports: [CommonModule, FlexLayoutModule],
  exports: [CatalogPromotionalElementsComponent]
})
export class CatalogPromotionalElementsModule {}
