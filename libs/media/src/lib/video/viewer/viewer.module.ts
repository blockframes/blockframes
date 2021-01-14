import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoViewerComponent } from './viewer.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [ VideoViewerComponent ],
  exports: [ VideoViewerComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ]
})
export class VideoViewerModule { }
