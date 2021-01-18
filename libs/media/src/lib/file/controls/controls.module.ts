import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { PdfControlModule } from '../../pdf/control/control.module';

import { FileControlsComponent } from './controls.component';
import { VideoControlComponent } from '../../video/control/control.component';

@NgModule({
  declarations: [
    FileControlsComponent,
    VideoControlComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,

    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSliderModule,

    FileNameModule,
    DurationModule,
    PdfControlModule,
  ],
  exports: [ FileControlsComponent ],
})
export class FileControlsModule {}
