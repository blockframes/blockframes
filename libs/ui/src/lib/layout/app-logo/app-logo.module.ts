import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLogoComponent } from './app-logo.component';

// Blockframes
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  imports: [ImageReferenceModule, CommonModule],
  exports: [AppLogoComponent],
  declarations: [AppLogoComponent]
})
export class AppLogoModule {}
