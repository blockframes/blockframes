import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLogoComponent } from './app-logo.component';

// Blockframes
import { ImgAssetModule } from '../../theme';

@NgModule({
  imports: [ImgAssetModule, CommonModule],
  exports: [AppLogoComponent],
  declarations: [AppLogoComponent]
})
export class AppLogoModule {}
