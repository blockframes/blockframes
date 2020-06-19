import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLogoComponent } from './app-logo.component';

// Blockframes
import { ImgModule } from '@blockframes/ui/media/img/img.module';

@NgModule({
  imports: [ImgModule, CommonModule],
  exports: [AppLogoComponent],
  declarations: [AppLogoComponent]
})
export class AppLogoModule {}
