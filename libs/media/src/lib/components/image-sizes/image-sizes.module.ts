import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { ImageSizeComponent } from './image-sizes.component';
import { MatCardModule } from '@angular/material/card';

// Pipes
import { ImgSizePipe } from './images-sizes.pipe';

@NgModule({
  declarations: [
    ImageSizeComponent,
    ImgSizePipe,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
  ],
  exports: [
    ImageSizeComponent,
    ImgSizePipe
  ]
})
export class ImageSizesModule { }
