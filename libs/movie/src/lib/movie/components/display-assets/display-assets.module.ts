import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { MovieDisplayAssetsComponent } from './display-assets.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, MatIconModule, FlexLayoutModule],
  declarations: [MovieDisplayAssetsComponent],
  exports: [MovieDisplayAssetsComponent]
})
export class MovieDisplayAssetsModule {}
