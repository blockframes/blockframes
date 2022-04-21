import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ImageModule } from '../../image/directives/image.module';
import { VideoViewerComponent } from '../../video/viewer/viewer.component';

import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';

@NgModule({
  declarations: [VideoViewerComponent],
  imports: [
    CommonModule,

    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    SnackbarErrorModule,

    ImageModule,
  ],
  exports: [VideoViewerComponent],
})
export class VideoViewerModule { }