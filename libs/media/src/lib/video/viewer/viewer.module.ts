
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { VideoViewerComponent } from '../../video/viewer/viewer.component';

@NgModule({
  declarations: [ VideoViewerComponent ],
  imports: [
    CommonModule,

    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,

    ImageModule,
  ],
  exports: [ VideoViewerComponent ],
})
export class VideoViewerModule {}
