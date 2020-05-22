import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLogoComponent } from './app-logo.component';

// Blockframes
import { ImgAssetModule } from '../../theme';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

@NgModule({
  imports: [ImgAssetModule, ImageReferenceModule, CommonModule],
  exports: [AppLogoComponent],
  declarations: [AppLogoComponent]
})
export class AppLogoModule {}
