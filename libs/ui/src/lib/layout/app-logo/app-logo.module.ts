import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLogoComponent } from './app-logo.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';

@NgModule({
  imports: [ImageModule, CommonModule],
  exports: [AppLogoComponent],
  declarations: [AppLogoComponent]
})
export class AppLogoModule {}
