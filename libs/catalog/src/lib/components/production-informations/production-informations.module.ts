import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogProductionInformationsComponent } from './production-informations.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

@NgModule({
  declarations: [CatalogProductionInformationsComponent],
  imports: [CommonModule, FlexLayoutModule, ImageReferenceModule],
  exports: [CatalogProductionInformationsComponent]
})
export class CatalogProductionInformationsModule {
}
