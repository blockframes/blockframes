import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogPromotionalElementsComponent } from './promotional-elements.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'

@NgModule({
  declarations: [CatalogPromotionalElementsComponent],
  imports: [CommonModule, FlexLayoutModule, MatIconModule, MatButtonModule],
  exports: [CatalogPromotionalElementsComponent]
})
export class CatalogPromotionalElementsModule {}
