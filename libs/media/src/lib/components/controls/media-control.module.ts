import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';

import { MediaControlComponent } from './media-control.component';
import { PdfControlComponent } from './pdf-control/pdf-control.component';
import { VideoControlComponent } from './video-control/video-control.component';

@NgModule({
  declarations: [
    MediaControlComponent,
    PdfControlComponent,
    VideoControlComponent,
  ],
  imports: [
    CommonModule,

    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSliderModule,

    FileNameModule,
    DurationModule,
  ],
  exports: [ MediaControlComponent ],
})
export class MediaControlModule {}
