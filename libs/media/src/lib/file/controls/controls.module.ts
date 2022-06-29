
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

import { PdfControlModule } from '../../pdf/control/control.module';
import { VideoControlModule } from '../../video/control/control.module';

import { FileControlsComponent } from './controls.component';

@NgModule({
  declarations: [ FileControlsComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,

    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSliderModule,

    FileNameModule,
    PdfControlModule,
    VideoControlModule,
  ],
  exports: [ FileControlsComponent ],
})
export class FileControlsModule {}
