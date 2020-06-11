import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { ImageSizeComponent } from './image-sizes.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    ImageSizeComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
  ],
  exports: [
    ImageSizeComponent
  ]
})
export class ImageSizesModule { }
