
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';

import { FileCarouselComponent } from './carousel.component';
import { ImageModule } from '../../image/directives/image.module';
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';

import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [ FileCarouselComponent ],
  imports: [
    CommonModule,
    RouterModule,

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
