
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';

import { VideoControlComponent } from '../../video/control/control.component';

@NgModule({
  declarations: [ VideoControlComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,

    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSliderModule,

    FileNameModule,
    DurationModule,
  ],
  exports: [ VideoControlComponent ],
})
export class VideoControlModule {}
