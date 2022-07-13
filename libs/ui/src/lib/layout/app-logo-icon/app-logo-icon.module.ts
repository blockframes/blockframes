import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLogoIconComponent } from './app-logo-icon.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';

@NgModule({
  imports: [ImageModule, CommonModule],
  exports: [AppLogoIconComponent],
  declarations: [AppLogoIconComponent]
})
export class AppLogoIconModule {}
