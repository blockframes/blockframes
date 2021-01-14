
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';

import { FileCarouselComponent } from './carousel.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [ FileCarouselComponent ],
  imports: [
    CommonModule,
    RouterModule,
    MatLayoutModule,

    FileNameModule,
    ImageModule,
    MaxLengthModule,
    CarouselModule,
    FlexLayoutModule,

    MatTooltipModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatDialogModule,
  ],
  exports: [ FileCarouselComponent ],
})
export class FileCarouselModule {}
