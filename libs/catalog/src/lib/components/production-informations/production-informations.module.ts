import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogProductionInformationsComponent } from './production-informations.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CropperModule } from '@blockframes/ui/cropper/cropper.module';

@NgModule({
  declarations: [CatalogProductionInformationsComponent],
  imports: [CommonModule, FlexLayoutModule, CropperModule],
  exports: [CatalogProductionInformationsComponent]
})
export class CatalogProductionInformationsModule {
}
